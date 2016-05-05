'use strict';
var utilities = require('../utilities');
var resizeModule = require('./resize-form');
var updateBackground = require('./background');

/** @enum {number} */
var Action = {
  ERROR: 0,
  UPLOADING: 1,
  CUSTOM: 2
};

/**
 * Форма загрузки изображения.
 * @type {HTMLFormElement}
 */
var uploadForm = document.forms['upload-select-image'];

/**
 * @type {HTMLElement}
 */
var uploadMessage = document.querySelector('.upload-message');

/**
 * @param {Action} action
 * @param {string=} message
 * @return {Element}
 */
function showMessage(action, message) {
  var isError = false;

  switch (action) {
    case Action.UPLOADING:
      message = message || 'Кексограмим&hellip;';
      break;

    case Action.ERROR:
      isError = true;
      message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
      break;
  }

  uploadMessage.querySelector('.upload-message-container').innerHTML = message;
  utilities.showElement(uploadMessage);
  uploadMessage.classList.toggle('upload-message-error', isError);
  return uploadMessage;
}

function showUploadingMsg() {
  showMessage(Action.UPLOADING);
}

function showErrorMsg() {
  showMessage(Action.ERROR);
}

function hideMessage() {
  utilities.hideElement(uploadMessage);
}

/**
 * Обработчик изменения изображения в форме загрузки. Если загруженный
 * файл является изображением, считывается исходник картинки, создается
 * Resizer с загруженной картинкой, добавляется в форму кадрирования
 * и показывается форма кадрирования.
 * @param {Event} evt
 */

var onUploadFormCnange = function(evt) {
  var element = evt.target;
  if (element.id === 'upload-file') {
    // Проверка типа загружаемого файла, тип должен быть изображением
    // одного из форматов: JPEG, PNG, GIF или SVG.
    if (utilities.isImgFile(element.files[0].type)) {
      var fileReader = new FileReader();

      showUploadingMsg();

      fileReader.onload = function() {
        resizeModule.setResizer(fileReader.result);
        hideUploadForm();
        resizeModule.showResizeForm();
        hideMessage();
      };

      fileReader.readAsDataURL(element.files[0]);
      element.value = '';
    } else {
      // Показ сообщения об ошибке, если загружаемый файл, не является
      // поддерживаемым изображением.
      showErrorMsg();
    }
  }
};

function showUploadForm() {
  uploadForm.addEventListener('change', onUploadFormCnange);
  updateBackground();
  utilities.showElement(uploadForm);
}
showUploadForm();

function hideUploadForm() {
  utilities.hideElement(uploadForm);
  uploadForm.removeEventListener('change', onUploadFormCnange);
}

module.exports = {
  showUploadForm: showUploadForm,
  hideUploadForm: hideUploadForm
};
