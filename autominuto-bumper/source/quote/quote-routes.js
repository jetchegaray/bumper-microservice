'use strict'

angular.module('amApp').config(manageQuoteDetailRoutes)

function manageQuoteDetailRoutes($stateProvider) {
  $stateProvider
    .state('quote_details',{
      url: '/quote/:quoteId',
      templateUrl: 'quote/views/quote-details.html',
      controller : 'QuoteDetailsController as $ctrl',
      params: {
      }
    })
}
