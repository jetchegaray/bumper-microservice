'use strict'

angular.module('amApp').controller('RejectBudgetAmModalController', RejectBudgetAmModalController)


function RejectBudgetAmModalController($scope, issue, userName, modelCar, sent, close) {
        $scope.issue = issue
        $scope.userName = userName
        $scope.modelCar = modelCar
        $scope.sent = sent
        $scope.comments = ""
        $scope.checkNoGivenService = false

        $scope.close = function(result) {
          result = (result) ? {comments: $scope.comments, checkNoGivenService: $scope.checkNoGivenService} : null
          close(result, 500); // close, but give 500ms for bootstrap to animate
        }
      }