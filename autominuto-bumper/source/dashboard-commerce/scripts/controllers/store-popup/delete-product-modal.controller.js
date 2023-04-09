'use strict'

angular.module('amApp').controller('DeleteProductAmModalController', DeleteProductAmModalController)

function DeleteProductAmModalController($scope, typeName, type, close) {

   	$scope.typeName = typeName
    $scope.type = type

    $scope.close = function(result) {
      close(result, 500)
    }

}