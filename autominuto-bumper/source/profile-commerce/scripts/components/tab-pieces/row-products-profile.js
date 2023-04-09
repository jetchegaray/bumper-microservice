'use strict';

angular.module('amApp').component('rowProductProfile', {
  templateUrl: 'profile-commerce/views/tab-pieces/row-product-profile.html',
  controller: ListProductsProfileController,
  bindings: {
    products: '<',
    link:'<',
  }
});

function ListProductsProfileController() {
  var $ctrl = this;
}
