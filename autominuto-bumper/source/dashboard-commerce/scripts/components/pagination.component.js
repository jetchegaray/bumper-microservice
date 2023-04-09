'use strict'

angular
  .module('amApp')
  .component('simplePagination', {
    bindings: {
      loadNextPage: '<',
      loadPreviousPage: '<',
      nextPageEnabled: '<',
      previousPageEnabled: '<'
    },
    controller: paginationSimpleController,
    templateUrl: 'dashboard-commerce/views/pagination-simple.html'
  })

function paginationSimpleController() {
  var $ctrl = this

  $ctrl.onLoadPreviousPage = () => {
    if($ctrl.previousPageEnabled) {
      $ctrl.loadPreviousPage()
    }
  }

  $ctrl.onLoadNextPage = () => {
    if($ctrl.nextPageEnabled) {
      $ctrl.loadNextPage()
    }
  }

  $ctrl.$onInit = function() {
    $ctrl.nextPageEnabled = true
    $ctrl.previousPageEnabled = false
  }

}
