'use strict';

var Gallery = function() {
  var self = this;

  var galleryContainer = document.querySelector('.gallery-overlay');
  var closeElement = galleryContainer.querySelector('.gallery-overlay-close');
  var preview = galleryContainer.querySelector('.gallery-overlay-image');
  var comment = galleryContainer.querySelector('.comments-count');
  var like = galleryContainer.querySelector('.likes-count');

  /** @type {Array.<string>} */
  var galleryPictures = [];

  var currentIndex = 0;

  /** @param {Array.<Object>} arrayOfPictures */
  this.savePicturesArray = function(arrayOfPictures) {
    galleryPictures = arrayOfPictures;
  };

  /**
   * Отрисовка картинки по индексу
   * @param {number} index
   */
  this.renderPreview = function(index) {
    currentIndex = index;
    var picture = galleryPictures[index];
    preview.src = picture.url;
    comment.textContent = picture.comments;
    like.textContent = picture.likes;
  };

  /** @param {number|string} param */
  this.showGallery = function(param) {

    if (typeof param === 'string') {
      galleryPictures.forEach(function(picture, index) {
        if (picture.url === param) {
          param = index;
        }
      });
    }

    this.renderPreview(param);

    preview.addEventListener('click', this._onPhotoClick);
    closeElement.addEventListener('click', this.hideGallery);
    galleryContainer.addEventListener('click', this._onOverlayClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);

    galleryContainer.classList.remove('invisible');
  };

  this.hideGallery = function() {
    galleryContainer.classList.add('invisible');
    preview.removeEventListener('click', this._onPhotoClick);
    closeElement.removeEventListener('click', this.hideGallery);
    galleryContainer.removeEventListener('click', this._onOverlayClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
    location.hash = '';
  };

  this._onPhotoClick = function() {
    var pic = galleryPictures[++currentIndex];
    var url = pic.url;
    location.hash = 'photo/' + url;
  };

  this._onDocumentKeyDown = function(evt) {
    if (evt.keyCode === 27) {
      evt.preventDefault();
      self.hideGallery();
    }
  };

  this._onOverlayClick = function(evt) {
    if (evt.target.classList.contains('gallery-overlay')) {
      self.hideGallery();
    }
  };
};

var galleryObj = new Gallery();

module.exports = galleryObj;
