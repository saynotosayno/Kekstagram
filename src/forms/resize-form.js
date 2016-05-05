'use strict';

var Resizer = require('../resizer');
var utilities = require('../utilities');

/**
 * Форма кадрирования изображения.
 * @type {HTMLFormElement}
 */
var resizeForm = document.forms['upload-resize'];
var resizeSide = resizeForm.querySelector('#resize-size');
resizeSide.min = 1;
var resizeX = resizeForm.querySelector('#resize-x');
resizeX.min = 0;
var resizeY = resizeForm.querySelector('#resize-y');
resizeY.min = 0;
var resizeFwd = resizeForm.querySelector('#resize-fwd');

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
 * Устанавливает currentResizer
 * @param {string} image
 */
function setResizer(image) {
  cleanupResizer();
  currentResizer = new Resizer(image);
  currentResizer.setElement(resizeForm);
}

/**
 * Проверяет, валидны ли данные, в форме кадрирования.
  Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.
  Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.
  Поля «сверху» и «слева» не могут быть отрицательными.
 * @return {boolean}
 */
function resizeFormIsValid() {
  var intSide = parseInt(resizeSide.value, 10);
  var intX = parseInt(resizeX.value, 10);
  var intY = parseInt(resizeY.value, 10);

  if (intSide < 1 || (intX + intSide) > currentResizer._image.naturalWidth || (intY + intSide) > currentResizer._image.naturalHeight || intX < 0) {
    return false;
  }
  return intY >= 0;
}

/**
 * Установка динамических максимальных значений полей формы по вводу.
 * Перерисовка currentResiser по изменению значений полей формы.
 */
var onResizeFormInput = function() {
  resizeSide.max = Math.min(currentResizer._image.naturalWidth, currentResizer._image.naturalHeight);
  resizeX.max = currentResizer._image.naturalWidth - parseInt(resizeSide.value, 10);
  resizeY.max = currentResizer._image.naturalHeight - parseInt(resizeSide.value, 10);

  if (resizeFormIsValid()) {
    resizeFwd.removeAttribute('disabled');
    resizeFwd.classList.remove('upload-form-controls-fwd-disabled');
  } else {
    resizeFwd.setAttribute('disabled', 'disabled');
    resizeFwd.classList.add('upload-form-controls-fwd-disabled');
  }
  currentResizer.setConstraint(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10), parseInt(resizeSide.value, 10));
};

/** Изменение значений полей по перетаскиванию изображения мышью. */
var onImageMouseDrag = function() {
  var squareObj = currentResizer.getConstraint();
  resizeSide.value = squareObj.side;
  resizeX.value = squareObj.x;
  resizeY.value = squareObj.y;
};

/**
 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
 * кропнутое изображение в форму добавления фильтра и показывает ее.
 * @param {Event} evt
 */
var onResizeFormSubmit = function(evt) {
  evt.preventDefault();

  if (resizeFormIsValid()) {
    var filterModule = require('./filter-form');
    // устанавливаем адрес обрезанной картинки
    filterModule.setFilterImageSrc(currentResizer.exportImage().src);

    hideResizeForm();
    filterModule.showFilterForm();
  }
};

/**
 * Обработка сброса формы кадрирования. Возвращает в начальное состояние
 * и обновляет фон.
 * @param {Event} evt
 */
var onResizeFormReset = function(evt) {
  evt.preventDefault();

  cleanupResizer();
  hideResizeForm();

  var uploadModule = require('./upload-form');
  uploadModule.showUploadForm();
};

/**
 * Показывает форму кадрирования
 */
var showResizeForm = function() {
  resizeForm.addEventListener('input', onResizeFormInput);
  window.addEventListener('resizerchange', onImageMouseDrag);
  resizeForm.addEventListener('submit', onResizeFormSubmit);
  resizeForm.addEventListener('reset', onResizeFormReset);

  utilities.showElement(resizeForm);
};

/**
 * Скрывает форму кадрирования
 */
var hideResizeForm = function() {
  utilities.hideElement(resizeForm);

  resizeForm.removeEventListener('input', onResizeFormInput);
  window.removeEventListener('resizerchange', onImageMouseDrag);
  resizeForm.removeEventListener('submit', onResizeFormSubmit);
  resizeForm.removeEventListener('reset', onResizeFormReset);
};

module.exports = {
  setResizer: setResizer,
  cleanupResizer: cleanupResizer,
  showResizeForm: showResizeForm,
  hideResizeForm: hideResizeForm
};
