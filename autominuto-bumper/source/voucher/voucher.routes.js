'use strict'

angular.module('amApp').config(voucherRoutes)

function voucherRoutes($stateProvider) {

  $stateProvider
    .state('voucher1', {
      url: '/voucher1',
      templateUrl: 'voucher/views/voucher.html',
    })
}
