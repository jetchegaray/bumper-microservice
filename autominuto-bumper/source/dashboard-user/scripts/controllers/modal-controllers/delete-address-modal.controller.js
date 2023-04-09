'use strict'

angular.module('amApp').controller('DeleteAddressAmModalController', DeleteAddressAmModalController)

function DeleteAddressAmModalController($scope, close, textDeleteModal, deleteElement) {

        $scope.textDeleteModal =  textDeleteModal;
        $scope.deleteElement = deleteElement;
        
        $scope.close = function(result) {
          close(result, 500); // close, but give 500ms for bootstrap to animate
        };

        $scope.delete = (result) => {
          if($scope.deleteElement){
            result = $scope.deleteElement;
            close(result, 500);
          }
        }
      }