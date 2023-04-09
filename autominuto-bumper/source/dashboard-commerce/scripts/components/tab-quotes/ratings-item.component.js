'use strict'

angular.module('amApp').component('ratingsItem', {
  controller: RatingsItemController,
  templateUrl: "dashboard-commerce/views/tab-quotes/ratings-item.html",
  bindings: {
    rating: '<',
    updatePage: '<',
    ratingsItems: '<'
  }
})

function RatingsItemController($scope) {
  var $ctrl = this

  $ctrl.$onInit = ()=>{
  }

  $ctrl.getMainTitle = (rating) => {
    if(rating.isQuote) {
      return "Pedido de cotización"
    }
    return "Compra"
  }

  

}