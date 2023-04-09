'use strict'

angular.module('amApp').component('rowProduct', {
  templateUrl: 'dashboard-commerce/views/store-tab/row-product.html',
  controller: ListProductsController,
  bindings: {
    products: '<',
    editProduct: '<',
    deleteProduct: '<'
  }
})

function ListProductsController() {
  var $ctrl = this

}
