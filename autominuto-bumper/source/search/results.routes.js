'use strict'

angular.module('amApp').config(resultsRoutes)

function resultsRoutes($stateProvider) {

  $stateProvider.state('results', {
    url: '/busqueda/:serviceSlug/:brandSlug/:locationSlug',
    templateUrl: 'search/views/results.html',
    controller: 'ResultsController as $ctrl',
    params: {
      preserveLocationStored: false,
      brandSlug: { squash: true, value: null },
      locationSlug: { squash: true, value: null }
    }
  })
}
