'use strict'

angular.module('amApp').config(homeRoutes)

function homeRoutes($stateProvider) {
  
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/views/home.html',
      controller: 'HomeController as $ctrl',
    })
}