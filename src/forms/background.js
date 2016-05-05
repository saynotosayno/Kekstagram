'use strict';

/**
 * @type {HTMLElement}
 */
var backgroundElement = document.querySelector('.upload');

var images = [
  'img/logo-background-1.jpg',
  'img/logo-background-2.jpg',
  'img/logo-background-3.jpg'
];

/**
 * Ставит одну из трех случайных картинок на фон формы загрузки.
 */
function updateBackground() {
  var randomImageNumber = Math.round(Math.random() * (images.length - 1));
  backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
}

updateBackground();

module.exports = updateBackground;
