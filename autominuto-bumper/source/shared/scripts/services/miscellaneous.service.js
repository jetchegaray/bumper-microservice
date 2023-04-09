'use strict'

angular.module('amApp').factory('miscellaneous', miscellaneous)

function miscellaneous() {

  return {
    nullSafe: nullSafe,
    hideDiv: hideDiv,
  }

  function nullSafe(value) {
    return value === null ? '' : value
  }

  function hideDiv(element) {
    $(element).hide()
  }
}