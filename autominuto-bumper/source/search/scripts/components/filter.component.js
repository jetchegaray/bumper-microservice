'use strict'

angular.module('amApp').component('resultsFilter', {
  templateUrl: 'search/views/filter.html',
  controllerAs: '$ctrl',
  controller: filterCtrl,
  bindings: {
    promo: '=',
    updatePromo: '&',
    recommended: '=',
    updateRecommended: '&',
    quality: '=',
    updateQuality: '&',
    updateOrderBy: '&'
  }
})

function filterCtrl() {

  const $ctrl = this

  $ctrl.orderBy = {
    selected: {name: 'Menor Precio', id: 1},
    options: [
      {name: 'Menor precio', id: 1},
      {name: 'Mayor precio', id: 2}
    ]
  }

  $ctrl.orderChanged = () => {
    $ctrl.updateOrderBy({val: $ctrl.orderBy.selected})
  }
}
