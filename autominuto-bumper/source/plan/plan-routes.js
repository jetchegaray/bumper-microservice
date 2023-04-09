'use strict'

angular.module('amApp').config(managePlanRoutes)

function managePlanRoutes($stateProvider) {
  $stateProvider
    .state('plans', {
      url: '/plan/:commerceId',
      templateUrl: 'plan/views/plans.html',
      controller: 'PlanController as $ctrl'
    })
    .state('showPlans', {
      url: '/planes',
      templateUrl: 'plan/views/plans.html',
      controller: 'PlanController as $ctrl'
    })
}
