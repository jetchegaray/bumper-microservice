'use strict'

angular.module('amApp').controller('WhoweareAmModalController', WhoweareAmModalController)


function WhoweareAmModalController($scope, $stateParams, $auth, commerceService, SOCIAL_RECOMMENDATION_URL, SOCIAL_RECOMMENDATION, close) {

      $scope.close = function(result) {
        close(result, 500)
      }
  }