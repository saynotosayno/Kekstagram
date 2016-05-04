'use strict';

var Gallery = function() {

  this.galleryContainer = document.querySelector('.gallery-overlay');
  this.closeElement = this.galleryContainer.querySelector('.gallery-overlay-close');
  this.preview = this.galleryContainer.querySelector('.gallery-overlay-image');
  this.comment = this.galleryContainer.querySelector('.comments-count');
  this.like = this.galleryContainer.querySelector('.likes-count');

  /** @type {Array.<string>} */
  this.galleryPictures = [];

  this.currentIndex = 0;

  this.hideGallery = this.hideGallery.bind(this);
  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onOverlayClick = this._onOverlayClick.bind(this);
};

/** @param {Array.<Object>} arrayOfPictures */
Gallery.prototype.savePicturesArray = function(arrayOfPictures) {
  this.galleryPictures = arrayOfPictures;
};

/**
 * Отрисовка картинки по индексу
 * @param {number} index
 */
Gallery.prototype.renderPreview = function(index) {
  this.currentIndex = index;
  var picture = this.galleryPictures[index];
  this.preview.src = picture.url;
  this.comment.textContent = picture.comments;
  this.like.textContent = picture.likes;
};

/** @param {number|string} param */
Gallery.prototype.showGallery = function(param) {

  if (typeof param === 'string') {
    this.galleryPictures.forEach(function(picture, index) {
      if (picture.url === param) {
        param = index;
      }
    });
  }

  this.renderPreview(param);

  this.preview.addEventListener('click', this._onPhotoClick);
  this.closeElement.addEventListener('click', this.hideGallery);
  this.galleryContainer.addEventListener('click', this._onOverlayClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);

  this.galleryContainer.classList.remove('invisible');
};

Gallery.prototype.hideGallery = function() {
  this.galleryContainer.classList.add('invisible');
  this.preview.removeEventListener('click', this._onPhotoClick);
  this.closeElement.removeEventListener('click', this.hideGallery);
  this.galleryContainer.removeEventListener('click', this._onOverlayClick);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
  location.hash = '';
};

Gallery.prototype._onPhotoClick = function() {
  var pic = this.galleryPictures[++this.currentIndex];
  var url = pic.url;
  location.hash = 'photo/' + url;
};

Gallery.prototype._onDocumentKeyDown = function(evt) {
  if (evt.keyCode === 27) {
    evt.preventDefault();
    this.hideGallery();
  }
};

Gallery.prototype._onOverlayClick = function(evt) {
  if (evt.target.classList.contains('gallery-overlay')) {
    this.hideGallery();
  }
};

var galleryObj = new Gallery();

module.exports = galleryObj;
