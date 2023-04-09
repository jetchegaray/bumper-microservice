'use strict'

angular.module('amApp').component('userFilterCategory', {
  controller: UserFilterCategoryController,
  templateUrl: "dashboard-user/views/tab-quotes/user-filter-category.html",
  bindings: {
    category: '@',
    newBudgets: '<',
    changeFilter: '<'
  }
})

function UserFilterCategoryController() {
  var $ctrl = this
}