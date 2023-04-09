'use strict'

angular.module('amApp').controller('DeleteCouponAmModalController', DeleteCouponAmModalController)

function DeleteCouponAmModalController($scope, typeName, type, close) {

   	$scope.typeName = typeName
    $scope.type = type

    $scope.close = function(result) {
      close(result, 500)
    }

}