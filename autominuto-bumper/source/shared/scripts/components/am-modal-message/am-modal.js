'use strict'

angular.module('amApp').controller('AmModalController', AmModalController)

function AmModalController($scope, title, message, modalClass, colorType, dismissButton, secondButton, modalImageRoute, titleColorType, labelButtonOne, labelButtonTwo, close) {

      $scope.title = title
      $scope.message = message
      $scope.modalClass = modalClass
      $scope.colorType = colorType ? colorType : 'success'
      $scope.dismissButton = (dismissButton != undefined || dismissButton != null) ? dismissButton : true
      $scope.modalImageRoute = modalImageRoute
      $scope.secondButton = secondButton
      $scope.titleColorType = titleColorType 
      $scope.labelButtonOne = labelButtonOne ? labelButtonOne : 'Entendido'
      $scope.labelButtonTwo = labelButtonTwo ? labelButtonTwo : 'En otro momento'

      $scope.close = (res) => {
        close(res, 500)
      }
  

}