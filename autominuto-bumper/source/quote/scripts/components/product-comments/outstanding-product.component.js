 'use strict'

angular.module('amApp').component('outstandingQuote', {
  templateUrl: 'product/views/product-comments/outstanding-product.html',
  controller: OutstandingQuotController,
  bindings: {
    rating : '<',
    recommendation: '<',
    name: '@',
    total: '<',
    type: '@',
    quality: '<' 
  }
})

function OutstandingQuotController() {

	var $ctrl = this
  $ctrl.ratingTotal = 0

  $ctrl.$onInit = () => {
    
    if ($ctrl.recommendation && $ctrl.rating){
      $ctrl.ratingTotal = ($ctrl.recommendation + $ctrl.rating)  / 2    
    }else if ($ctrl.recommendation){
      $ctrl.ratingTotal = $ctrl.recommendation
    }else if ($ctrl.rating){
      $ctrl.ratingTotal = $ctrl.rating
    }else {
      $ctrl.ratingTotal = 0
    }
  }

}