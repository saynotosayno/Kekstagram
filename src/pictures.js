'use strict';

var PictureElement = require('./picture-element');
var galleryModule = require('./gallery');

var filters = document.querySelector('.filters');
filters.classList.add('hidden');
var picturesData = [];
var pictureContainer = document.querySelector('.pictures');
var filtersContainer = document.querySelector('.filters');

/** @type {Array.<Object>} */
var filteredPictures = [];

/** @constant {number} */
var PAGE_SIZE = 12;

/** @type {number} */
var pageNumber = 0;

/** @constant {string} */
var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';

/** @param {function(Array.<Object>)} callback */
var getPictures = function(callback) {
  var picturesBlock = document.querySelector('.pictures');
  picturesBlock.classList.add('pictures-loading');
  picturesBlock.classList.remove('pictures-failure');
  var xhr = new XMLHttpRequest();

  var removeListeners = function() {
    xhr.removeEventListener('load', onLoad);
    xhr.removeEventListener('error', onError);
    xhr.removeEventListener('timeout', onTimeout);
  };

  var onLoad = function(evt) {
    removeListeners();
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
    picturesBlock.classList.remove('pictures-loading');
  };
  xhr.addEventListener('load', onLoad);

  function changeInformSticker() {
    picturesBlock.classList.add('pictures-failure');
    picturesBlock.classList.remove('pictures-loading');
  }

  var onError = function() {
    removeListeners();
    console.warn('Что-то пошло не так');
    changeInformSticker();
  };
  xhr.addEventListener('error', onError);

  xhr.timeout = 10000;
  var onTimeout = function() {
    removeListeners();
    console.warn('Нет ответа от сервера. Проверьте подключение к интернету');
    changeInformSticker();
  };
  xhr.addEventListener('timeout', onTimeout);
  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
};

/** @return {boolean} */
var isBottomReached = function() {
  var picturesContainerPosition = pictureContainer.getBoundingClientRect();
  return picturesContainerPosition.bottom - window.innerHeight <= 0;
};

/**
 * @param {Array} pictures
 * @param {number} page
 * @param {number} pageSize
 * @return {boolean}
 */
var isNextPageAvailable = function(pictures, page, pageSize) {
  return page <= Math.floor(pictures.length / pageSize);
};

var scrollTimeout;

var onWindowScroll = function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    renderNextPages();
  }, 100);
};

/* скролл через debounce */
var setScrollEnabled = function() {
  window.addEventListener('scroll', onWindowScroll);
};

/** @type {Array.<PictureElement>} */
var renderedPictures = [];

/**
 * @param {Array.<Object>} pictures
 * @param {number} page
 * @param {boolean} replace
 */
var renderPictures = function(pictures, page, replace) {
  if (replace) {
    pictureContainer.innerHTML = '';
  }
  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;
  pictures.slice(from, to).forEach(function(picture) {
    renderedPictures.push(new PictureElement(picture, pictureContainer));
  });
};

/** @param {boolean} reset */
var renderNextPages = function(reset) {
  if (reset) {
    pageNumber = 0;
    renderedPictures.forEach(function(picture) {
      picture.remove();
    });
    renderedPictures = [];
  }
  while(isBottomReached() &&
        isNextPageAvailable(picturesData, pageNumber, PAGE_SIZE)) {
    renderPictures(filteredPictures, pageNumber);
    pageNumber++;
  }
};

/**
* @param {Array.<Object>} pictures
* @param {string} filter
*/
var getFilteredPictures = function(pictures, filter) {
  var picturesToFilter = pictures.slice(0);
  switch (filter) {
    case 'filter-new':
      picturesToFilter.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      picturesToFilter = picturesToFilter.filter(function(a) {
        return new Date(a.date).valueOf() >= Date.now() - 14 * (3600 * 24 * 1000) && new Date(a.date).valueOf() <= Date.now();
      });
      break;
    case 'filter-discussed':
      picturesToFilter.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;
  }
  return picturesToFilter;
};

/** @param {string} filter */
var setFilterEnabled = function(filter) {
  filteredPictures = getFilteredPictures(picturesData, filter);
  galleryModule.savePicturesArray(filteredPictures);
  pageNumber = 0;
  renderNextPages(true);
};

var onFiltersContainerClick = function(evt) {
  if (evt.target.classList.contains('filters-radio')) {
    setFilterEnabled(evt.target.id);
  }
};

var setFiltrationEnabled = function() {
  filtersContainer.addEventListener('click', onFiltersContainerClick);
};

getPictures(function(loadedPictures) {
  picturesData = loadedPictures;
  setFiltrationEnabled();
  setFilterEnabled('filter-popular');
  setScrollEnabled();
  restoreFromHash();
  window.addEventListener('hashchange', _onHashChange);
});

var restoreFromHash = function() {
  if (location.hash.match(/#photo\/(\S+)/)) {
    galleryModule.showGallery(location.hash.replace('#photo/', ''));
  }
};

var _onHashChange = function() {
  restoreFromHash();
};

filters.classList.remove('hidden');
