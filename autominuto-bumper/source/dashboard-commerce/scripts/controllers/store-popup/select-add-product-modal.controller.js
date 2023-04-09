'use strict'

angular.module('amApp').controller('SelectAddProductModalController', SelectAddProductModalController)

function SelectAddProductModalController($scope, close) {
        $scope.product = {}

        $scope.addProductOrService = function(isService) {
          $scope.product.service = isService
          close({ product: $scope.product }, 500);
        }

      }