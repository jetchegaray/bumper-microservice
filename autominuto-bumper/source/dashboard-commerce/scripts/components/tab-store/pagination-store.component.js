'use strict'

angular.module('amApp').component('paginationStore', {
  templateUrl: 'dashboard-commerce/views/store-tab/pagination-store.html',
  controller: StorePaginationController,
  bindings: {
    loadPage: '<',
    totalPages: '<',
    currentPage: '<'
  }
})

function StorePaginationController() {
  var $ctrl = this

  $ctrl.getArrayPages = () => {
    let pages = []
    for(let index = 1; index <= $ctrl.totalPages; index++) {
      pages.push(index)
    }
    return pages
  }

  $ctrl.onNextPage = () => {
    if($ctrl.currentPage === $ctrl.totalPages) return
    $ctrl.loadPage($ctrl.currentPage + 1)
  }

  $ctrl.onPreviousPage = () => {
    if($ctrl.currentPage === 1) return
    $ctrl.loadPage($ctrl.currentPage - 1)
  }


}
