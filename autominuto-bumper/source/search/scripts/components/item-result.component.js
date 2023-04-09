'use strict'

angular.module('amApp').component('resultsItemResult', {
  templateUrl: 'search/views/item-result.html',
  controllerAs: '$ctrl',
  controller: itemResultCtrl,
  bindings: {
    commerceId: '<',
    commerceSlug: '<',
    official: '<',
    grade: '<',
    logo: '<',
    validated: '<',
    name: '<',
    stars: '<',
    isOpen: '<',
    workingTime: '<',
    description: '<',
    services: '<',
    price: '<',
    products: '<',
    searchService: '<',
    searchBrand: '<',
    isProduct: '<',
    commerceLocation: '<',
    currentLocation: '<',
    imagesBrands: '<',
    imagesCategories: '<',
  }
})

function itemResultCtrl(locationService, $state, $window) {

  const $ctrl = this

  $ctrl.showWorkingHours = false

  $ctrl.$onInit = () => { 
    $ctrl.showProductsSlider = false
  }

  $ctrl.workingHoursAvailable = () =>{
    return $ctrl.workingHours
  }

  $ctrl.isQuotable = () => {
    return $ctrl.searchService.quoteable == true
  }

  //customer's always asking for a quote request in this case.   
  $ctrl.askQuoteOrAppointment = () => {
    $window.fbq('track', 'clickAskQuoteOrAppointmentFromResultSearch')
    
    var url = $state.href('ask_appointment', {commerceSlug : $ctrl.commerceSlug, commerceId : $ctrl.commerceId, serviceSlug : $ctrl.searchService.slug})  
    window.open(url,'_blank')
  }

  $ctrl.distance = () => {
    let distance = ''
    if ($ctrl.currentLocation && $ctrl.commerceLocation.length) {
      let commerceLocation = {lat: parseFloat($ctrl.commerceLocation[0]), lng: parseFloat($ctrl.commerceLocation[1])}
      distance = locationService.measureDistance($ctrl.currentLocation, commerceLocation, true)
    }
    return distance
  }

  $ctrl.slickConfig = {
    enabled: true,
    infinite: true,
    arrows: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      { breakpoint: 1198, settings: {slidesToShow: 2, slidesToScroll: 2}},
      { breakpoint: 992,  settings: {slidesToShow: 3, slidesToScroll: 3}},
      { breakpoint: 666,  settings: {slidesToShow: 2, slidesToScroll: 2}},
      { breakpoint: 560,  settings: {slidesToShow: 1, slidesToScroll: 1}},
    ]
  }

  $ctrl.goProfileCommerce = () => {
    var url = $state.href('profile_commerce', { commerceSlug: $ctrl.commerceSlug, commerceId: $ctrl.commerceId})
    window.open(url,'_blank')
  }

  $ctrl.goToCommerce = (commerceId) =>{
    var url = $state.href('profile_commerce', { commerceSlug: $ctrl.commerceSlug, commerceId: commerceId})
    window.open(url,'_blank')
  }

  //customer's always asking for a product to buy in this case.   
  $ctrl.goProductDetail = (product) => {
    var url = $state.href('product_detail', {commerceId: $ctrl.commerceId, productId: product.id})
    window.open(url,'_blank')
  }
}
