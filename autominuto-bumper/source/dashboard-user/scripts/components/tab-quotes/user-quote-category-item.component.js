'use strict'

angular.module('amApp').component('userQuoteCategoryItem', {
  controller: UserQuoteCategoryItemController,
  templateUrl: "dashboard-user/views/tab-quotes/user-quote-category-item.html",
  bindings: {
    buildBudget: '<',
    rejectBudget: '<',
    filter: '<',
    currentFilter: '<',
    request: '<',
    associatedAccount: '<?',
    creditCards: '<?'
  }
})

function UserQuoteCategoryItemController($scope, errorService) {
  var $ctrl = this
  $ctrl.elementListData
  $ctrl.currentPage = 1
  $ctrl.loadingContent = true //use only for show message of item when loading data
  $ctrl.showMessage = false

  $ctrl.$onChanges = (changes)=>{
    if(changes.currentFilter){
      $ctrl.showMessage = false
      if(changes.currentFilter.currentValue == $ctrl.filter){
        loadElements($ctrl.currentPage, $ctrl.filter)
      }
    }
  }

  function updatePaginationStatus(){
    $ctrl.nextPageEnabled = ($ctrl.currentPage >= $ctrl.totalPages) ? false : true
    $ctrl.previousPageEnabled = ($ctrl.currentPage > 1) ? true : false
  }

  function loadElements(page, filter){
    // $ctrl.elementListData = []
    $.LoadingOverlay("show")
    $ctrl.loadingContent = true
    $ctrl.request(page, filter)
    .then((data) => {
      $ctrl.elementListData = data.userQuotes
      $ctrl.totalPages = data.totalPages
      $ctrl.filterToShow = data.filterToShow
      updatePaginationStatus();
    })
    .catch(err => {
      errorService.handle(err)
    })
    .then(() => {
      $.LoadingOverlay("hide")
      $ctrl.showMessage = true
      $ctrl.loadingContent = false
    })
  }

  /*
    previous load current page I ask for the last element in te list and if is 1 then reload previous page
  */
  $ctrl.updatePage = () => {
    $ctrl.showMessage = false
    if($ctrl.elementListData.length == 1 && $ctrl.currentPage > 1){
      $ctrl.currentPage--
    }
    
    loadElements($ctrl.currentPage, $ctrl.filter)
  }

  $ctrl.loadNextPage = () => {
    $ctrl.currentPage++
    loadElements($ctrl.currentPage, $ctrl.filter)
  }

  $ctrl.loadPreviousPage = () => {
    $ctrl.currentPage--
    loadElements($ctrl.currentPage, $ctrl.filter)
  }

}
