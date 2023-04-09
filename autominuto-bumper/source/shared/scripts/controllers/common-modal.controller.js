'use strict'

angular.module('amApp').controller('CommonAmModalController', CommonAmModalController)

function CommonAmModalController($scope, close) {

      $scope.close = (res) => {
        close(res, 500)
      }

}



