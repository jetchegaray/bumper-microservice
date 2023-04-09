'use strict'

angular.module('amApp').component('notFoundComponent', {
  templateUrl: 'shared/views/not-found-error/not-found-view.html',
  controller: NotFoundController,
  bindings: {
    imageRoute: '@',
    showUps: '<'
  }
})

function NotFoundController() {
  var $ctrl = this
  $ctrl.showUps = true
}