'use strict'

angular.module('amApp').controller('ErrorController', ErrorController)

function ErrorController($state, $scope, userService) {
  var $ctrl = this

  $ctrl.dataUser = userService.getUserData()
}
