'use strict';

/** @enum {string} */
var FileType = {
  'GIF': '',
  'JPEG': '',
  'PNG': '',
  'SVG+XML': ''
};
/**
 * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
 * из ключей FileType.
 * @type {RegExp}
 */
var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

function isImgFile(type) {
  return fileRegExp.test(type);
}

var invisibleClass = 'invisible';

/**
 * Делает элемент видимым
 * @param  {HTMLElement} element
 */
function showElement(element) {
  element.classList.remove(invisibleClass);
}

/**
 * Скрывает элемент
 * @param  {HTMLElement} element
 */
function hideElement(element) {
  element.classList.add(invisibleClass);
}

module.exports = {
  isImgFile: isImgFile,
  showElement: showElement,
  hideElement: hideElement
};
