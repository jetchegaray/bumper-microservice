'use strict'

angular.module('amApp').controller('UpdatePasswordController', UpdatePasswordController)

function UpdatePasswordController(errorHandler, ModalService, spinner, userService, $state, $stateParams, modalMessageService, errorService) {

  const $ctrl = this

  $ctrl.validateForm = {
    'nickname': {'min': 6, 'max': 12},
    'password': {'min': 6, 'max': 20, 'pattern': '[a-zA-Z0-9_\.]+'},
  }

  $ctrl.$onInit = () => {
    if ($stateParams.token && $stateParams.code) {
      $ctrl.token = $stateParams.token
      $ctrl.verificationCode = $stateParams.code
    } else {
      $state.go('home')
    }
  }

  $ctrl.update = () => {

    spinner.start()

    userService.updatePassword($ctrl.token, $ctrl.verificationCode, $ctrl.password)
      .then(() => {
        modalMessageService.success('¡Contraseña actualizada exitosamente!', '', () => { $state.go('login') })
      })
      .catch(err => {
        errorService.handle(err)
      })
      .finally(spinner.stop)
  }

  $ctrl.displayError = (elem) => {
    return ($ctrl.updateForm[elem].$touched || $ctrl.updateForm.$submitted) && $ctrl.updateForm[elem].$invalid
  }
}