'use strict'

angular.module('amApp').component('resultsItemResultPopup', {
  templateUrl: 'search/views/item-result-popup.html',
  controllerAs: '$ctrl',
  controller: itemResultPopupCtrl,
  bindings: {
    official: '<',
    grade: '<',
    logo: '<',
    validated: '<',
    name: '<',
    stars: '<',
    distance: '<',
    address: '<',
    phone: '<',
    workingTime: '<',
    isOpen: '<',
    commerceId: '<',
    goProfileCommerce: '<'
  }
})

function itemResultPopupCtrl() {
}
