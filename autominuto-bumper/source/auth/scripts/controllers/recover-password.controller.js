'use strict'

angular.module('amApp').controller('RecoverPasswordController', RecoverPasswordController)

function RecoverPasswordController(modalMessageService, $state, spinner, userService, errorService) {

  const $ctrl = this

  $ctrl.recover = () => {

    spinner.start()

    userService.recoverPassword($ctrl.email)
      .then(() => modalMessageService.success('Revisa tu casilla de mail', 'Te hemos enviado un mail con las instrucciones para crear una clave nueva' , () => { $state.go('home')} ))
      .catch(err => {
        if (err.data && err.data.code == 40420){
          modalMessageService.error(err.data.description, '')
        }else {
          errorService.handle(err)
        }
      }).finally(spinner.stop)
  }

  $ctrl.displayError = (elem) => {
    return ($ctrl.recoverForm[elem].$touched || $ctrl.recoverForm.$submitted) && $ctrl.recoverForm[elem].$invalid
  }
}