'use strict'

angular.module('amApp').controller('ResultPopupController', ResultPopupController)

function ResultPopupController($scope, results, brand, currentLocation, $element, locationService, close) {

  const $ctrl = this

  $ctrl.popupItems = []
  $ctrl.brand = brand
  $ctrl.currentLocation = currentLocation

  $ctrl.onInit = function() {
    results.forEach(function(item) {
      item.address = locationService.getAddressLine(item.location)
      item.distance = $ctrl.getDistance(item.location)
      $ctrl.popupItems.push(item)
    })
  }

  $ctrl.getDistance = (location) => {
    let distance = ''
    if ($ctrl.currentLocation && location) {
      let commerceLocation = {lat: parseFloat(location.lat), lng: parseFloat(location.lng)}
      distance = locationService.measureDistance($ctrl.currentLocation, commerceLocation, true)
    }
    return 'A ' + distance + ' de tu ubicación.'
  }

  $ctrl.close = (commerceId) => {
    $element.modal('hide')
    close(commerceId, 500)
  }

  $ctrl.goProfileCommerce = (id) => {
    var url = $state.href('profile_commerce', { commerceId: id})
    window.open(url,'_blank')
  }

  // Init
  $ctrl.onInit()
}
