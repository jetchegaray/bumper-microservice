'use strict'

angular.module('amApp').component('fastSearchComponent', {
  templateUrl: 'search/views/fast-search-component.html',
  controller: fastSearchController,
  bindings: {
    brands: '<'
  }
})

function fastSearchController($scope, $state, locationService, searchService, localStorageService, spinner, modalMessageService, $window) {

  const $ctrl = this

  $ctrl.flags = {
    addressDirty: false
  }

  $ctrl.basicSearch = {
    service: null,
    brand: null,
    address: null,
    onlyOfficialCommerces: false,
    onlyOfficialSpareParts: false,
    useLocation: false,
    otherLocation: false
  }

  $ctrl.search = () => {
    spinner.start()
    const brand = $ctrl.brands.find(b => b.value === $ctrl.basicSearch.brand.value)
    const basicSearch = Object.assign($ctrl.basicSearch, { brand })
    let params = searchService.setCurrentSearch(basicSearch)
    localStorageService.set('searchParams', params)
    spinner.stop()
    $window.fbq('track', 'clickSearchFromHome')
    
    $state.go('results', {'serviceSlug' : params.service.slug, 'brandSlug' : params.brand.slug, 
      'locationSlug': params.location.slug, 'preserveLocationStored' : true})
  }

  $ctrl.placeChanged = function() {
    $ctrl.flags.addressDirty = true
    let address = locationService.parseGoogleAddress(this.getPlace(), true)
    $ctrl.setAddress(address)
  }

  $ctrl.setAddress = (address) => {
    $ctrl.basicSearch.address = address
  }

  // $scope.$watch('$ctrl.rawAddress', function(){
  //   if($ctrl.rawAddress && !$ctrl.basicSearch.useLocation){
  //     $ctrl.basicSearch.address = undefined
  //     $ctrl.allowSearch();
  //   }
  // });

  $ctrl.useLocation = () => {

    if ($ctrl.basicSearch.useLocation) {

      spinner.start()

      locationService.getBrowserLocation().then(res => {
        const coords = {lat: res.coords.latitude, lng: res.coords.longitude}
        return locationService.geocode(coords)
      })
      .then(googleAddress => {
        const parsedAddress = locationService.parseGoogleAddress(googleAddress, true)
        $ctrl.setAddress(parsedAddress)
        $ctrl.rawAddress = locationService.getAddressLine(parsedAddress)
      })
      .catch(err => {
        modalMessageService.error('Hubo un error al obtener su ubicación', '')
        $ctrl.basicSearch.useLocation = false
      })
      .then(() => {
        $.LoadingOverlay('hide', true)
        $scope.$apply()
      })

    } else {
      $ctrl.setAddress(null)
      $ctrl.rawAddress = ''
    }
  }
  
  $ctrl.allowSearch = () => {
    return $ctrl.basicSearch.brand
            && ($ctrl.basicSearch.address)
            && ($ctrl.basicSearch.service)
  }

  $ctrl.clear = () => {
    $('.button-clear').hide()
  }
}