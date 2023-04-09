'use strict'

angular.module('amApp').config(manageProductDetailRoutes)

function manageProductDetailRoutes($stateProvider) {
  $stateProvider
    .state('product_detail',{
      url: '/comercio/:commerceId/producto/:productId',
      templateUrl: 'product/views/productDetail.html',
      controller : 'ProductDetailController as $ctrl',
      params: {
        quoteId : null,
        quoteReplyId : null,
        redirectToMP: null,
        currentProduct: null
      }
    })
}
