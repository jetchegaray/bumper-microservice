'use strict'

angular.module('amApp').component('storeProduct', {
  templateUrl: 'dashboard-commerce/views/store-tab/product.html',
  controller: StoreProductController,
  bindings: {
    product:'<',
    editProduct: '<',
    deleteProduct: '<',
  }
})

function StoreProductController() {
  var $ctrl = this

}
