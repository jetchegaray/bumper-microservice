'use strict'

angular.module('amApp').factory('spinner', spinner)

function spinner() {

  return {
    start: start,
    stop: stop,
  }

  function start() {
    $.LoadingOverlay('show')
  }

  function stop() {
    $.LoadingOverlay('hide', true)
  }
}