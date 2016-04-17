'use strict';

var filters = document.querySelector('.filters');
filters.classList.add('hidden');

var pictureContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('#picture-template');
var elementToClone;

if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.picture');
} else {
  elementToClone = templateElement.querySelector('.picture');
}

/** @constant {number} */
var IMAGE_LOAD_TIMEOUT = 10000;

/**
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement}
 */
var getPictureElement = function(data, container) {
  var element = elementToClone.cloneNode(true);
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;
  container.appendChild(element);

  var image = new Image();
  var imageLoadTimeout;

  image.onload = function(evt) {
    clearTimeout(imageLoadTimeout);
    element.querySelector('img').src = evt.target.src;
  };

  image.onerror = function() {
    element.classList.add('picture-load-failure');
  };

  image.src = data.url;

  imageLoadTimeout = setTimeout(function() {
    image.src = '';
    element.classList.add('picture-load-failure');
  }, IMAGE_LOAD_TIMEOUT);

  return element;
};

window.pictures.forEach(function(picture) {
  getPictureElement(picture, pictureContainer);
});

filters.classList.remove('hidden');
