'use strict'

angular.module('amApp').factory('viewport', viewport)

function viewport($window, $document) {

  return {
    isInViewport: isInViewport
  }

  function isInViewport(elem) {
    let bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= ($window.innerHeight || $document.documentElement.clientHeight) &&
        bounding.right <= ($window.innerWidth || $document.documentElement.clientWidth)
    );
  }
}