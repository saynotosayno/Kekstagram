/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var browserCookies = require('browser-cookies');

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap = {
    'none': 'filter-none',
    'chrome': 'filter-chrome',
    'sepia': 'filter-sepia'
  };

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

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

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
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

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
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];
  var lastFilter = browserCookies.get('lastFilter') || 'none';
  var checkedFilter = document.querySelector('#upload-filter-' + lastFilter);
  checkedFilter.setAttribute('checked', 'checked');


  /**
   * Добавление значения фильтра из cookie к изображению при загрузке.
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');
  filterImage.className = 'filter-image-preview ' + filterMap[lastFilter];

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
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };
/**
  * Установка динамических максимальных значений полей формы по вводу.
  */
  resizeForm.oninput = function() {
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
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Расчет дней до истечения cookie.
   */
  function calcDaysToExpire() {
    var dateOfBirth = new Date('1989-08-17');
    var currentYear = new Date().getFullYear();
    var lastBithday = new Date(currentYear, dateOfBirth.getMonth(), dateOfBirth.getDate());
    var daysFromBD;
    if (lastBithday < new Date()) {
      daysFromBD = (new Date().valueOf() - lastBithday.valueOf()) / 24 / 60 / 60 / 1000;
    } else {
      lastBithday.setFullYear(lastBithday.getFullYear() - 1);
      daysFromBD = (new Date().valueOf() - lastBithday.valueOf()) / 24 / 60 / 60 / 1000;
    }
    return daysFromBD;
  }
  var daysToExpire = calcDaysToExpire();

  /**
   * Функция записи последнего фильтра в cookie.
  */
  function setLastFilterToCookie() {
    var currentFilter = document.querySelector('input[name="upload-filter"]:checked');
    browserCookies.set('lastFilter', currentFilter.value, {expires: daysToExpire});
  }

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    setLastFilterToCookie();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

    setLastFilterToCookie();
  };

  cleanupResizer();
  updateBackground();
})();
