'use strict'

angular.module('amApp').component('filterCategory', {
  controller: FilterCategoryController,
  templateUrl: "dashboard-commerce/views/tab-quotes/filter-category.html",
  bindings: {
    categories: '<',
    changeFilter: '<',
    currentFilter: '<',
    metadata: '<',
  }
})

function FilterCategoryController($scope) {
  var $ctrl = this

  $scope.$watch('$ctrl.metadata', () => {
    $ctrl.metadata && $ctrl.metadata.map((filter) => {
      let category = _.find($ctrl.categories, {name: filter.status });
      category && (category.quantity = filter.quantity);
    });
  });

  $ctrl.$onInit = () => {
  }

}
