'use strict';

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
var getPictureElement = function(data) {
  var element = elementToClone.cloneNode(true);
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  var image = new Image();
  var imageLoadTimeout;

  image.onload = function(evt) {
    clearTimeout(imageLoadTimeout);
    var img = element.querySelector('img');
    img.src = evt.target.src;
    img.width = 182;
    img.height = 182;
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

/**
 * @param {Object} data
 * @param {Number} index
 * @param {Element} container
 * @constructor
 */
var Photo = function(data, container) {
  this.data = data;
  this.element = getPictureElement(this.data);

  this.onPictureClick = this.onPictureClick.bind(this);

  this.element.addEventListener('click', this.onPictureClick);
  container.appendChild(this.element);
};

Photo.prototype.onPictureClick = function(evt) {
  location.hash = 'photo/' + this.data.url;
  evt.preventDefault();
};

Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this.onPictureClick);
  this.element.parentNode.removeChild(this.element);
};

module.exports = Photo;
