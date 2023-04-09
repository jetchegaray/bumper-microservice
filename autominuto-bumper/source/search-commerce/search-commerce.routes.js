 'use strict'

angular.module('amApp').config(searchCommerceRoutes)

function searchCommerceRoutes($stateProvider) {

  $stateProvider.state('searchCommerce', {
  	url: '/buscar-comercio',
  	controller: 'SearchCommerceController as $ctrl',
  	templateUrl: 'search-commerce/views/searchCommerce.html'
  })
}

