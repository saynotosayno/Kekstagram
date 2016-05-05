'use strict';

var resizeModule = require('./resize-form');
var uploadModule = require('./upload-form');
var utilities = require('../utilities');

/**
 * Форма добавления фильтра.
 * @type {HTMLFormElement}
 */
var filterForm = document.forms['upload-filter'];
var lastFilter = localStorage.getItem('lastFilter') || 'none';
var checkedFilter = filterForm.querySelector('#upload-filter-' + lastFilter);
checkedFilter.setAttribute('checked', 'checked');

/**
 * @type {Object.<string, string>}
 */
var filterMap = {
  'none': 'filter-none',
  'chrome': 'filter-chrome',
  'sepia': 'filter-sepia'
};

/**
 * Добавление значения фильтра из cookie к изображению при загрузке.
 * @type {HTMLImageElement}
 */
var filterImage = filterForm.querySelector('.filter-image-preview');
filterImage.className = 'filter-image-preview ' + filterMap[lastFilter];
function setFilterImageSrc(src) {
  filterImage.src = src;
}

/**
 * Сброс формы фильтра. Показывает форму кадрирования.
 * @param {Event} evt
 */

var onFilterFormReset = function(evt) {
  evt.preventDefault();
  hideFilterForm();
  resizeModule.showResizeForm();
};

/** Функция записи последнего фильтра в LocalStorage. */

function setLastFilterToStorage() {
  var currentFilter = filterForm.querySelector('input[name="upload-filter"]:checked');
  localStorage.setItem('lastFilter', currentFilter.value);
}

/**
 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
 * выбранному значению в форме.
 */

var onFilterFormChange = function() {

  var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
    return item.checked;
  })[0].value;

  // Класс перезаписывается, а не обновляется через classList потому что нужно
  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
  // состояние или просто перезаписывать.
  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

  setLastFilterToStorage();
};

/**
 * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
 * записав сохраненный фильтр в cookie.
 * @param {Event} evt
 */
var onFilterFormSubmit = function(evt) {
  evt.preventDefault();

  setLastFilterToStorage();
  hideFilterForm();
  resizeModule.cleanupResizer();
  uploadModule.showUploadForm();
};

function showFilterForm() {
  filterForm.addEventListener('change', onFilterFormChange);
  filterForm.addEventListener('reset', onFilterFormReset);
  filterForm.addEventListener('submit', onFilterFormSubmit);

  utilities.showElement(filterForm);
}

function hideFilterForm() {
  utilities.hideElement(filterForm);

  filterForm.removeEventListener('change', onFilterFormChange);
  filterForm.removeEventListener('reset', onFilterFormReset);
  filterForm.removeEventListener('submit', onFilterFormSubmit);
}

module.exports = {
  filterForm: filterForm,
  setLastFilterToStorage: setLastFilterToStorage,
  showFilterForm: showFilterForm,
  hideFilterForm: hideFilterForm,
  setFilterImageSrc: setFilterImageSrc
};
