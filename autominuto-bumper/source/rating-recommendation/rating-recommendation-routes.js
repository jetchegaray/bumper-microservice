'use strict'

angular.module('amApp').config(manageRatingRoutes)

function manageRatingRoutes($stateProvider) {
  $stateProvider
    .state('quote_rating', {
      url: '/presupuesto/:quoteId/calificar',
      templateUrl: 'rating-recommendation/views/quote_rating.html',
      controller: 'QuoteRatingController as $ctrl',
      metaTags: {
        robots: 'noindex,nofollow'
      }
    })
    .state('bought_rating', {
      url: '/compra/:paymentId/calificar',
      templateUrl: 'rating-recommendation/views/bought_rating.html',
      controller: 'BoughtRatingController as $ctrl',
      metaTags: {
        robots: 'noindex,nofollow'
      }
    })
    .state('commerce_recommendation', {
      url: '/comercio/:commerceId/recomendacion',
      templateUrl: 'rating-recommendation/views/commerce_recommendation.html',
      controller: 'RecommendationController as $ctrl',
      params: {
        savedRecommendation: null
      },
      metaTags: {
        robots: 'noindex,nofollow'
      }
    })
}
