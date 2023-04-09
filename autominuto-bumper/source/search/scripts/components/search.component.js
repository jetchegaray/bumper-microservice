'use strict'

angular.module('amApp').component('resultsSearch', {
  templateUrl: 'search/views/search.html',
  controller: searchCtrl,
  bindings: {
    onSearch: '&',
    updateServiceType: '&',
    updateBrand: '&',
    updateLocation: '&',
    defaultServiceType: '<',
    defaultBrand: '<',
    defaultLocation: '<',
    brands: '<',
    servicesTypes: '<'
  }
})

function searchCtrl(_, locationService) {

  const $ctrl = this
  $ctrl.selectedBrand = { label: '' }
  $ctrl.selectedServieType = $ctrl.defaultServiceType || { label: '' }
  $ctrl.rawAddress = ''
  $ctrl.types = "['address']"

  $ctrl.$onChanges = changesObj => {
    if (changesObj.defaultBrand && changesObj.defaultBrand.currentValue) {
      $ctrl.selectedBrand = changesObj.defaultBrand.currentValue
    }
    if (changesObj.defaultServiceType && changesObj.defaultServiceType.currentValue) {
      $ctrl.selectedServiceType = changesObj.defaultServiceType.currentValue
    }
    if (changesObj.defaultLocation && changesObj.defaultLocation.currentValue) $ctrl.setDefaultLocation()
  }

  $ctrl.onSelectServiceType = () => {
    if ($ctrl.selectedServiceType) {
      $ctrl.updateServiceType({ serviceType : _.find($ctrl.servicesTypes, function (serviceType){ return serviceType.id == $ctrl.selectedServiceType.id})})
    }
  }

  $ctrl.onSelectBrand = selected => {
    if (selected) {
      const brand = $ctrl.brands.find(b => b.value === $ctrl.selectedBrand.value)
      $ctrl.updateBrand({ brand })
    }
  }

  $ctrl.setAddress = location => $ctrl.updateLocation({ location })

  $ctrl.placeChanged = function() {
    $ctrl.setAddress(locationService.parseGoogleAddress(this.getPlace(), true))
  }

  $ctrl.setDefaultLocation = () => $ctrl.rawAddress = locationService.getAddressLine($ctrl.defaultLocation)

}
