'use strict';

var resizeModule = require('./resize-form');

/**
 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
 * кропнутое изображение в форму добавления фильтра и показывает ее.
 * @param {Event} evt
 */
resizeModule.resizeForm.addEventListener('submit', function(evt) {
  evt.preventDefault();

  if (resizeModule.resizeFormIsValid()) {
    filterImage.src = resizeModule.exportImageFromResizer();

    resizeModule.resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  }
});

/**
 * Форма добавления фильтра.
 * @type {HTMLFormElement}
 */
var filterForm = document.forms['upload-filter'];
var lastFilter = localStorage.getItem('lastFilter') || 'none';
var checkedFilter = document.querySelector('#upload-filter-' + lastFilter);
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

/**
 * Сброс формы фильтра. Показывает форму кадрирования.
 * @param {Event} evt
 */
filterForm.addEventListener('reset', function(evt) {
  evt.preventDefault();

  filterForm.classList.add('invisible');
  resizeModule.resizeForm.classList.remove('invisible');
});

// /** Расчет дней до истечения cookie. */
// function calcDaysToExpire() {
//   var dateOfBirth = new Date('1989-08-17');
//   var currentYear = new Date().getFullYear();
//   var lastBithday = new Date(currentYear, dateOfBirth.getMonth(), dateOfBirth.getDate());
//   var daysFromBD;
//   if (lastBithday < new Date()) {
//     daysFromBD = (new Date().valueOf() - lastBithday.valueOf()) / 24 / 60 / 60 / 1000;
//   } else {
//     lastBithday.setFullYear(lastBithday.getFullYear() - 1);
//     daysFromBD = (new Date().valueOf() - lastBithday.valueOf()) / 24 / 60 / 60 / 1000;
//   }
//   return daysFromBD;
// }
// var daysToExpire = calcDaysToExpire();

/** Функция записи последнего фильтра в LocalStorage. */
function setLastFilterToStorage() {
  var currentFilter = document.querySelector('input[name="upload-filter"]:checked');
  localStorage.setItem('lastFilter', currentFilter.value);
}

/**
 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
 * выбранному значению в форме.
 */
filterForm.addEventListener('change', function() {

  var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
    return item.checked;
  })[0].value;

  // Класс перезаписывается, а не обновляется через classList потому что нужно
  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
  // состояние или просто перезаписывать.
  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

  setLastFilterToStorage();
});

module.exports = {
  filterForm: filterForm,
  setLastFilterToStorage: setLastFilterToStorage
};
