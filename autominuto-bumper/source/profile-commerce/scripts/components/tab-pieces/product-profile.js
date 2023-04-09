'use strict';

angular.module('amApp').component('productProfile', {
  templateUrl: 'profile-commerce/views/tab-pieces/product.html',
  controller: ProductProfileController,
  bindings: {
    product: '<',
    link: '<',
  }
});


function ProductProfileController($state, $stateParams  ) {
  var $ctrl = this;


  $ctrl.isQuoteable = () => {
    return $ctrl.product.serviceType.quoteable
  }

  $ctrl.goToAskAppointments = (service) => {
    $state.go("ask_appointment", {commerceSlug: $stateParams.commerceSlug, commerceId : $stateParams.commerceId, serviceSlug : service.slug})
  }

}
