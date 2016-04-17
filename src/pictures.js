'use strict';

var filters = document.querySelector('.filters');
filters.classList.add('hidden');
var picturesData = [];
var pictureContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('#picture-template');
var filtersContainer = document.querySelector('.filters');
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

/** @constant {string} */
var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';

/** @param {function(Array.<Object>)} callback */
var getPictures = function(callback) {
  var picturesBlock = document.querySelector('.pictures');
  picturesBlock.classList.add('pictures-loading');
  picturesBlock.classList.remove('pictures-failure');
  var xhr = new XMLHttpRequest();

  /** @param {ProgressEvent} */
  xhr.onload = function(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
    picturesBlock.classList.remove('pictures-loading');
    console.log(loadedData);
  };
  xhr.onerror = function() {
    console.warn('Что-то пошло не так');
    picturesBlock.classList.add('pictures-failure');
    picturesBlock.classList.remove('pictures-loading');
  };
  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    console.warn('Нет ответа от сервера. Проверьте подключение к интернету');
    picturesBlock.classList.remove('pictures-loading');
  };
  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
};

/** @param {Array.<Object>} pictures */
var renderPictures = function(pictures) {
  pictureContainer.innerHTML = '';
  pictures.forEach(function(picture) {
    getPictureElement(picture, pictureContainer);
  });
};

/**
* @param {Array.<Object>} pictures
* @param {string} filter */

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
      console.log(picturesToFilter);
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
  var filteredPictures = getFilteredPictures(picturesData, filter);
  renderPictures(filteredPictures);
};

var setFiltrationEnabled = function() {
  var filtersRadio = filtersContainer.querySelectorAll('.filters-radio');
  for (var i = 0; i < filtersRadio.length; i++) {
    filtersRadio[i].onclick = function() {
      setFilterEnabled(this.id);
    };
  }
};

getPictures(function(loadedPictures) {
  picturesData = loadedPictures;
  setFiltrationEnabled();
  setFilterEnabled('filter-popular');
});

filters.classList.remove('hidden');
