'use strict'

angular.module('amApp').config(manageCommerceRoutes)

function manageCommerceRoutes($stateProvider) {
  $stateProvider
    .state('addcommerce', {
      url: '/alta-comercio',
      templateUrl: 'manage-commerce-data/views/manage-commerce-data-quick.html',
      controller: 'ManageCommerceDataController as $ctrl',
      params: {
       goToPlans: true
      },
      metaTags: {
        description: 'Aumentá las ventas de tu comercio automotor formando parte de la Red autominuto postulando tu comercio automotor en menos de 1´'
      }
    })
    .state('validatecommerce', {
      url: '/validar-comercio/:commerceId',
      templateUrl: 'manage-commerce-data/views/manage-commerce-data-quick.html',
      controller: 'ManageCommerceDataController as $ctrl',
      params: {
        goToPlans: true
      }
    })
}
