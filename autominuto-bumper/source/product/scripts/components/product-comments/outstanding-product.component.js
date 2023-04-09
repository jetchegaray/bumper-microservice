 'use strict'

angular.module('amApp').component('outstandingProduct', {
  templateUrl: 'product/views/product-comments/outstanding-product.html',
  controller: OutstandingProductController,
  bindings: {
    rating : '<',
    recommendation: '<',
    name: '@',
    total: '<',
    type: '@',
    quality: '<' 
  }
})

function OutstandingProductController() {

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