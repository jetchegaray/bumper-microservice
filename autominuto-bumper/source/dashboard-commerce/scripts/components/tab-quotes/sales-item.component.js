'use strict'

angular.module('amApp').component('salesItem', {
  controller: SalesItemController,
  templateUrl: "dashboard-commerce/views/tab-quotes/sales-item.html",
  bindings: {
    sale: '<',
    updatePage: '<',
    salesItems: '<'
  }
})

function SalesItemController($scope) {
  var $ctrl = this

  $ctrl.$onInit = ()=>{

  }

  $ctrl.getMainTitle = (product) => {
    if(product.service) {
      return "Venta de servicio"
    } else {
      return "Venta de producto"
    }
  }


}