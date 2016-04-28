'use strict';

var Resizer = require('./resizer');

var uploadModule = require('./upload-form');
var fileRegExp = uploadModule.fileRegExp;
var uploadForm = uploadModule.uploadForm;
var showMessage = uploadModule.showMessage;
var UPLOADING = uploadModule.UPLOADING;
var ERROR = uploadModule.ERROR;
var hideMessage = uploadModule.hideMessage;
var updateBackground = uploadModule.updateBackground;

/**
 * Форма кадрирования изображения.
 * @type {HTMLFormElement}
 */
var resizeForm = document.forms['upload-resize'];
var resizeSide = document.querySelector('#resize-size');
resizeSide.min = 1;
var resizeX = document.querySelector('#resize-x');
resizeX.min = 0;
var resizeY = document.querySelector('#resize-y');
resizeY.min = 0;

/**
 * Объект, который занимается кадрированием изображения.
 * @type {Resizer}
 */
var currentResizer;

/**
 * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
 * изображением.
 */
function cleanupResizer() {
  if (currentResizer) {
    currentResizer.remove();
    currentResizer = null;
  }
}
cleanupResizer();

/**
 * Обработчик изменения изображения в форме загрузки. Если загруженный
 * файл является изображением, считывается исходник картинки, создается
 * Resizer с загруженной картинкой, добавляется в форму кадрирования
 * и показывается форма кадрирования.
 * @param {Event} evt
 */
uploadForm.addEventListener('change', function(evt) {
  var element = evt.target;
  if (element.id === 'upload-file') {
    // Проверка типа загружаемого файла, тип должен быть изображением
    // одного из форматов: JPEG, PNG, GIF или SVG.
    if (fileRegExp.test(element.files[0].type)) {
      var fileReader = new FileReader();

      showMessage(UPLOADING);

      fileReader.onload = function() {
        cleanupResizer();

        currentResizer = new Resizer(fileReader.result);
        currentResizer.setElement(resizeForm);

        uploadForm.classList.add('invisible');
        resizeForm.classList.remove('invisible');
        hideMessage();
      };

      fileReader.readAsDataURL(element.files[0]);
    } else {
      // Показ сообщения об ошибке, если загружаемый файл, не является
      // поддерживаемым изображением.
      showMessage(ERROR);
    }
  }
});

/**
 * Проверяет, валидны ли данные, в форме кадрирования.
  Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.
  Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.
  Поля «сверху» и «слева» не могут быть отрицательными.
 * @return {boolean}
 */
function resizeFormIsValid() {
  if (parseInt(resizeSide.value, 10) < 1) {
    return false;
  }
  if ((parseInt(resizeX.value, 10) + parseInt(resizeSide.value, 10)) > currentResizer._image.naturalWidth) {
    return false;
  }
  if ((parseInt(resizeY.value, 10) + parseInt(resizeSide.value, 10)) > currentResizer._image.naturalHeight) {
    return false;
  }
  if (parseInt(resizeX.value, 10) < 0) {
    return false;
  }
  if (parseInt(resizeY.value, 10) < 0) {
    return false;
  }
  return true;
}

/**
 * Функция возвращает адрес обрезанной картинки из ресайзера
 */
function exportImageFromResizer() {
  return currentResizer.exportImage().src;
}

/**
 * Обработка сброса формы кадрирования. Возвращает в начальное состояние
 * и обновляет фон.
 * @param {Event} evt
 */
resizeForm.addEventListener('reset', function(evt) {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  resizeForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
});

/**
 * Установка динамических максимальных значений полей формы по вводу.
 * Перерисовка currentResiser по изменению значений полей формы.
 */
resizeForm.addEventListener('input', function() {
  resizeSide.max = Math.min(currentResizer._image.naturalWidth, currentResizer._image.naturalHeight);
  resizeX.max = currentResizer._image.naturalWidth - parseInt(resizeSide.value, 10);
  resizeY.max = currentResizer._image.naturalHeight - parseInt(resizeSide.value, 10);
  var ResizeFwd = document.querySelector('#resize-fwd');
  if (resizeFormIsValid()) {
    ResizeFwd.removeAttribute('disabled');
    ResizeFwd.classList.remove('upload-form-controls-fwd-disabled');
  } else {
    ResizeFwd.setAttribute('disabled', 'disabled');
    ResizeFwd.classList.add('upload-form-controls-fwd-disabled');
  }
  currentResizer.setConstraint(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10), parseInt(resizeSide.value, 10));
});

/** Изменение значений полей по перетаскиванию изображения мышью. */
window.addEventListener('resizerchange', function() {
  var squareObj = currentResizer.getConstraint();
  resizeSide.value = squareObj.side;
  resizeX.value = squareObj.x;
  resizeY.value = squareObj.y;
});


module.exports = {
  uploadForm: uploadForm,
  updateBackground: updateBackground,
  resizeForm: resizeForm,
  cleanupResizer: cleanupResizer,
  resizeFormIsValid: resizeFormIsValid,
  exportImageFromResizer: exportImageFromResizer
};
