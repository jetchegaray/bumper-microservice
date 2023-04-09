'use strict'

angular.module('amApp').controller('SearchCommerceController', SearchCommerceController)

function SearchCommerceController($state, $stateParams, searchCommerceService, locationService, errorService, userService, redirectService) {
  const $ctrl = this

  $ctrl.commerces = []
  $ctrl.name = ""
  $ctrl.savedName = ""
  $ctrl.selectedCommerce = null
  $ctrl.currentPage = 0
  $ctrl.totalPages = 0
  $ctrl.limitCommerce = 30
  $ctrl.showRegister = false
  $ctrl.totalCommerces = 0 

  $ctrl.loadPage = page => {
    if (page === $ctrl.currentPage) return
    $ctrl.getCommerces(page)
  }

  $ctrl.selectCommerce = commerce => {
    $ctrl.selectedCommerce = commerce
  }

  $ctrl.getCommerces = page => {
    $.LoadingOverlay("show");
    searchCommerceService.getCommerces({name: $ctrl.savedName}, page)
      .then(function (data) {
        $ctrl.commerces = data.data
        $ctrl.currentPage = page
        $ctrl.totalCommerces = data.total  
        $ctrl.totalPages = Math.ceil(data.total/data.perPages)
        $ctrl.selectedCommerce = null
        $ctrl.showRegister = true
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide", true)
      })
  }

  $ctrl.searchCommerces = () => {
    
    if($ctrl.name.length) {
      $ctrl.savedName = $ctrl.name
      $ctrl.getCommerces(1)
    }
  }


  $ctrl.getLocationParsed = (location) => {
    if (location == null)
      return "No se encontro una dirección Válida" 
    return locationService.getAddressLine(location)
  }

  $ctrl.goToValidateCommerce = () => {

    redirectService.setNextState("validatecommerce", {commerceId: $ctrl.selectedCommerce.id})

    if (userService.authenticated()) {
      redirectService.redirect()
    } else {
      $state.go("register_commerce")
    }
  } 

  $ctrl.goToAddCommerce = () => {

    redirectService.setNextState("addcommerce")

    if (userService.authenticated()) {
      redirectService.redirect()
    } else {
      $state.go("register_commerce")
    }
  } 

}
