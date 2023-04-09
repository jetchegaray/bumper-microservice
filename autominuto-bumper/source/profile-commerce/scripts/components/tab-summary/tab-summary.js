'use strict'

angular.module('amApp').component('tabSummary', {
  templateUrl: 'profile-commerce/views/tab-summary/tab-summary.html',
  controller: SummaryTabController,
  bindings: {
    commerce: '<'
  }
})

function SummaryTabController(commerceService, $stateParams, $state, homeService, spinner) {
  var $ctrl = this

  $ctrl.currentPage = 0
  $ctrl.recommendations = []
  const defaultImage = 'assets/images/icons-default/commerce.png'
  $ctrl.defaultImages = [defaultImage, defaultImage, defaultImage, defaultImage, defaultImage]
  $ctrl.onlyServices = []
  $ctrl.servicesOffered = []
  $ctrl.productsOffered = []

  $ctrl.showAllOnlyServices = false
  $ctrl.showAllProductsOrServicesOffered = false

  $ctrl.onlySelectedService = null 
  $ctrl.selectedOfferedService = null
  $ctrl.selectedOfferedProduct = null

  $ctrl.serviceSparePartsCheckbox = false
  $ctrl.visibleProducts = 7
  $ctrl.formatDate = "DD-MM-YYYY hh:mm:ss"
  $ctrl.formatOutput = "DD-MM-YYYY"

  $ctrl.limitCategoryServices = 15
  $ctrl.limitCategoryProductServices = 15
  $ctrl.limitCategoryProductAutoparts = 15

  $ctrl.descLimit = 1000
  $ctrl.descriptionExpanded = false
  
  $ctrl.changeLimit = () => {
    $ctrl.descLimit = $ctrl.commerce.description.length
    $ctrl.descriptionExpanded = true
  }

  $ctrl.$onChanges = function (changes) {
   if(changes.commerce && $ctrl.commerce){
      $ctrl.serviceSparePartsCheckbox = ($ctrl.commerce.topSpareParts.length > $ctrl.commerce.topServicesQuoteables.length)
      $ctrl.loadNextPage(1)
    }
  }

  $ctrl.loadNextPage = page => {
    $.LoadingOverlay("show");

    const  productsAndCouponsRequest = commerceService.productsAndCoupons($stateParams.commerceId)
      .then(data => { $ctrl.products = data.products; $ctrl.coupons = data.coupons; })
      
    /*const recommendationRequest = commerceService.getRecomendation($stateParams.commerceId)
      .then(data => {
        let recommendations = data.data
        if(recommendations.length) {
          $ctrl.currentPage = page
        }
        addRecommendations(recommendations)
      })
      .catch(error => {
        errorService.handle(err)
      })
    */
    const requests = [ productsAndCouponsRequest]
  
    Promise.all(requests).then(() => {
      $.LoadingOverlay('hide', true)
    })
  }

/*
  function addRecommendations(recommendations) {
    let counterRecommendations = 0
    let counterRatings = 0

    for(let index = 0; index < recommendations.length; index++) {
      let value = recommendations[index]
      //value.creation = moment(value.createdOn, $ctrl.formatDate)
      value.creation = moment(value.createdOn, $ctrl.formatDate).format($ctrl.formatOutput)
      if(value.isRecommendation) {
        counterRecommendations++
        if(counterRecommendations <= 3) {
          $ctrl.recommendations.push(value)
        }
      } else {
        counterRatings++
        if(counterRatings <= 3) {
          $ctrl.recommendations.push(value)
        }
      }
      value.user.pathImageSized = value.user.pathImage + '?width=150&height=150'
    }
  }
*/
  $ctrl.getMainImage = () => {
    if($ctrl.commerce.images && $ctrl.commerce.images.length) {
      return $ctrl.commerce.images[0].path + '?width=320&height=320'
    }
    return null
  }

  $ctrl.getFrontImage = () => {
    if($ctrl.commerce.images && $ctrl.commerce.images.length) {
      for (let index in $ctrl.commerce.images){
        if ($ctrl.commerce.images[index].front){
          return $ctrl.commerce.images[index].path + '?width=320&height=320'
        }    
      } 
    }
    let latLng = $ctrl.commerce.location.lat + "," + $ctrl.commerce.location.lng
    let firstLetter = $ctrl.commerce.name.charAt(0)
    return "https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCrQ3FBy08YFSKgo85QkFpA1w-crB2ZD7M&markers=color:blue|label:"+ firstLetter +"|"+ latLng + "&center="+ latLng +"&zoom=15&size=580x320"
  }

  $ctrl.getOtherImages = () => {
    if($ctrl.commerce.images && $ctrl.commerce.images.length) {
      let result = []
      for(let index = 0; index < $ctrl.commerce.images.length; index++) {
        let image = $ctrl.commerce.images[index]
        if(!image.logo && !image.map && image.path.length > 0) {
          let path = image.path
          if(result.length === 0) {
            result.push(path + '?width=511&height=511')
          } else {
            result.push(path + '?width=255&height=255')
          }
        }
      }
      return result
    }
  }

  $ctrl.getPopularCategories = () => {
    if(!$ctrl.commerce) return []
    return _.union($ctrl.commerce.topServicesQuoteables, $ctrl.commerce.topSpareParts, $ctrl.commerce.topServicesNoQuoteables)
  }

  $ctrl.selectService = service => {
    $state.go("ask_appointment", {commerceSlug : $stateParams.commerceSlug, commerceId : $stateParams.commerceId, serviceSlug : service.slug})
  }

  $ctrl.showButtonOurProduct = () => {
    if($ctrl.showAllProductsOrServicesOffered === false) {
      if($ctrl.serviceSparePartsCheckbox) {
        return $ctrl.commerce.categories.products.autoparts.length > $ctrl.visibleProducts
      } else {
        return $ctrl.commerce.categories.products.services.length > $ctrl.visibleProducts
      }
    }
    return false
  }

  $ctrl.loadMoreCategoryService = () =>{
    $ctrl.limitCategoryServices += 15
  }

  $ctrl.loadMoreCategoryProductService = () =>{
    $ctrl.limitCategoryProductServices += 15
  }

  $ctrl.loadMoreCategoryProductAutoparts = () =>{
    $ctrl.limitCategoryProductAutoparts += 15
  }

  $ctrl.goToProductDetails = (product) => {
    $state.go("product_detail",{commerceId : $stateParams.commerceId, productId : product.id})
  }

  $ctrl.hasAnyAditionals = () => {
    return $ctrl.commerce.hasWifi || $ctrl.commerce.hasAir || $ctrl.commerce.hasWaitingArea || $ctrl.commerce.hasPostSales || $ctrl.commerce.hasGaranty || 
    $ctrl.commerce.hasTemporalCar || $ctrl.commerce.hasComputerDiagnostics || $ctrl.commerce.hasSavingPlan
  }

  $ctrl.goToCoupons = () => {
     $state.go("profile_commerce_coupons",{commerceId : $stateParams.commerceId})
  }
}
