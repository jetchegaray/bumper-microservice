'use strict'

angular
  .module('amApp')
  .directive('promoHeader', function() {
    return {
      templateUrl: 'shared/views/tpl-promo-header.html'
    }
  })