'use strict'

angular.module('amApp').controller('RegisterCompleteController', RegisterCompleteController)

function RegisterCompleteController(modalMessageService, spinner, userService, $state, $stateParams, errorService) {

  const $ctrl = this

  $ctrl.$onInit = () => {
    if ($stateParams.userId && $stateParams.email) {
      $ctrl.userId = $stateParams.userId
      $ctrl.email = $stateParams.email

      userService.setUserInactiveBannerVisibility(false)

      this.sendEmail()

    } else {
      $state.go('home')
    }
  }

  $ctrl.sendEmail = () => {

    spinner.start()

    userService.sendActivationEmail($ctrl.userId)
      .then(() => modalMessageService.success('Mail Enviado', `Hemos enviado el link de activación al mail ${$ctrl.email}`, null))
      .catch(data => errorService.handle(data))
      .finally(spinner.stop)
  }
}


