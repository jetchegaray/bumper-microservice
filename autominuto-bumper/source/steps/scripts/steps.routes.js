'use strict'

angular.module('amApp').config(stepsRoutes)

function stepsRoutes($stateProvider) {

  $stateProvider
    .state('steps', {
      url: '/cotizar',
      templateUrl: 'steps/views/steps.html',
      controller: 'StepsController as $ctrl',
      params: {
        existingQuoteData: null
      },
      metaTags: {
        description: 'Contanos que necesitas o le esta pasando a tu auto para que podamos acercarte presupuestos cercanos de los comercios automotores de tu barrio'
      }
    })
    .state('steps.one', {
      url: '/servicio/:serviceSlug',
      component: 'stepOne',
      params: {
        serviceSlug: { squash: true, value: null },
      },
      metaTags: {
        description: 'Contanos que necesitas o le esta pasando a tu auto para que podamos acercarte presupuestos cercanos de los comercios automotores de tu barrio'
      }
    })
    .state('steps.two', {
      url: '/auto',
      component: 'stepTwo',
    })
    .state('steps.three', {
      url: '/lugar',
      component: 'stepThree',
    })
    .state('steps.final', {
      url: '/resumen',
      component: 'stepFinal',
      params: {
        existingQuoteData: null
      }
    })
}
