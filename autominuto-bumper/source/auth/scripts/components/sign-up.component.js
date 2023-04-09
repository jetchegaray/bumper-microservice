'use strict'

angular.module('amApp').component('signUpForm', {
  templateUrl: 'auth/views/sign-up.html',
  controller: SignUpController,
  bindings: {
    onSignUp: '&',
    isCommerce: '<',
    isFleet: '<'
  }
})

function SignUpController(userService, $timeout, $window, redirectService) {

  const $ctrl = this

  $window.fbq('track', 'UserDriverRegistrationView')

  $ctrl.signUp = () => {
    if ($ctrl.signUpForm.$valid) {
      $ctrl.onSignUp({email: $ctrl.email, password: $ctrl.password, name : $ctrl.name, phone : $ctrl.phone})
      if ($ctrl.isFleet){
        redirectService.setNextState('board.user.cars')
      }
    }
  }

  $ctrl.displayError = (elem) => {
    return $ctrl.signUpForm[elem] && ( $ctrl.signUpForm[elem].$invalid && ($ctrl.signUpForm[elem].$touched || $ctrl.signUpForm.$submitted) )
  }

  $ctrl.validations = {
    'name': {'max': 25},
    'password': {'min': 6, 'max': 20, 'pattern': '[a-zA-Z0-9_\.]+'},
  }

  $ctrl.onKeydown = (event, field = '') => {
    var s = String.fromCharCode(event.which);
    if (s.toUpperCase() === s && s.toLowerCase() !== s && !event.shiftKey ) {
      $('.tootiop-caps-lock' + field).addClass('tooltip-gen-auto');
      $timeout(
        function () {
            $('.tootiop-caps-lock' + field).removeClass('tooltip-gen-auto');
        }, 5000 //it has to match with seconds "animation: cssAnimation 5s forwards" in /source/shared/styles/tooltip/tooltip-gen.scss
      );
    }
  }
}
