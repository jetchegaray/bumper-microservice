'use strict'

angular.module('amApp').component('paginationComplete', {
  templateUrl: 'shared/views/pagination-complete.html',
  controller: PaginationCompleteController,
  bindings: {
    loadPage: '<',
    totalPages: '<',
    currentPage: '<'
  }
})

function PaginationCompleteController() {
  var $ctrl = this
  const maxPages = 10
  $ctrl.lowerLimit = 1
  $ctrl.topLimit = 1

  $ctrl.getArrayPages = () => {
    if(!$ctrl.totalPages) return
    let pages = []
    $ctrl.defineLimits()

    for(let index = $ctrl.lowerLimit; index <= $ctrl.topLimit; index++) {
      pages.push(index)
    }
    return pages
  }

  $ctrl.defineLimits = () => {
    if($ctrl.totalPages <= maxPages) {
      $ctrl.lowerLimit = 1
      $ctrl.topLimit = $ctrl.totalPages
      return
    }

    let half = maxPages/2
    $ctrl.lowerLimit = $ctrl.currentPage - half
    $ctrl.topLimit = $ctrl.lowerLimit + maxPages -1

    // if limits ares valid
    if($ctrl.lowerLimit > 0 && $ctrl.totalPages >= $ctrl.topLimit) return

    if($ctrl.currentPage >= maxPages) {
      $ctrl.lowerLimit = $ctrl.currentPage - maxPages + 1
      $ctrl.topLimit = $ctrl.lowerLimit + maxPages -1
    } else {
      $ctrl.lowerLimit = 1
      $ctrl.topLimit = maxPages
    }

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
