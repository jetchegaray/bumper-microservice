'use strict'

angular.module('amApp').component('filterStore', {
  templateUrl: 'dashboard-commerce/views/store-tab/filter-store.html',
  controller: FilterStoreController,
  bindings: {
    filters: '<',
    loadProductsWithFilter: '<',
    removeFilter: '<'
  }
})

function FilterStoreController() {
  var $ctrl = this

  $ctrl.limit = 6;
  $ctrl.showAll = false;

  $ctrl.getTitle = type => {
    return type === 'price' ? "Rango de precio": "Categorías"
  }

  $ctrl.indexValid = (index) => {
    if($ctrl.showAll) return true

    return index < $ctrl.limit
  }

  $ctrl.changeVisibility = () => {
    $ctrl.showAll = !$ctrl.showAll
  }

  $ctrl.updateStateFilters = (filter, type) => {
    for(let index = 0; index < $ctrl.filters.length; index++) {
      let selectedFilter = $ctrl.filters[index]

      if(selectedFilter.type === type) {
        let values = selectedFilter.values
        let state = !filter.active
        angular.forEach(values, function (value) {
          value.active = false
        })
        filter.active = state
      }
    }
  }

  $ctrl.onLoadProductsWithFilter = (filter, type) => {
    let removeFilter = filter.active
    $ctrl.updateStateFilters(filter, type)

    if(removeFilter) {
      $ctrl.removeFilter(type)
      return
    }
    $ctrl.loadProductsWithFilter({filter: filter, type: type})
  }

}
