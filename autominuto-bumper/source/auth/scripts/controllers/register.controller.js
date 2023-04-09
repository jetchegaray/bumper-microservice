'use strict'

angular.module('amApp').controller('RegisterController', RegisterController)

function RegisterController(errorHandler, spinner, modalMessageService, $state, $auth, $stateParams, $scope, localStorageService, userService, commerceService, redirectService, errorService, $window) {

  const $ctrl = this

  $ctrl.$onInit = () => {
    if ($state.current.name == 'register_driver' || $state.current.name == 'register_fleet'){ 
      $ctrl.signUp = userService.signUpUser
    }
    if ($state.current.name == 'register_commerce') {
      $ctrl.signUp = userService.signUpCommerce
    }
  }

  $ctrl.onSignUp = (email, password, name, phone) => {

    spinner.start()
    userService.verifyEmailExists(email)
      .then(() => $ctrl.signUp(email, password, name, phone))
      .then(
          data => {
            if ($state.current.name == 'register_commerce'){
              $window.fbq('track', 'CompleteRegistrationUserCommerce')
            } else {
              $window.fbq('track', 'CompleteRegistrationUserDriver')
            }
            userService.saveUserData(data)
            $ctrl.redirect(data, true)
          }
      )
      .catch(data => {
        $window.fbq('track', 'CompleteRegistrationError')
        errorService.handle(data)
      })
      .finally(spinner.stop)
  }

  $ctrl.authenticateFacebook = (hasCommerce) => {
    FB.login((auth) => {
      if (auth.status === 'connected') {
        FB.api('/me', {
            fields:'name, email, picture, first_name'
        }, (profile) => {
          let userImage = profile.picture && profile.picture.data ? profile.picture.data.url : ''
          FB.api(`/${profile.id}/picture?redirect=false&type=large`, (pictureResponse) => {
            if (pictureResponse && !pictureResponse.error) {
              userImage = pictureResponse.data ? pictureResponse.data.url : userImage
            }
            doSignUpSocial(profile.email, profile.first_name, profile.id, userImage, auth.authResponse.accessToken, hasCommerce)
          })
        })
      }
    }, {ctrl: 'public_profile, email'})
  }

  $ctrl.authenticate = (provider, userParams) => {
    spinner.start()
    $auth.authenticate(provider, userParams)
      .then(res => {
        $window.fbq('track', 'CompleteRegistration')
        userService.saveUserData(res.data)
        $ctrl.redirect(res.data)
      })
      .catch(err => {
        $window.fbq('track', 'CompleteRegistrationError')
        console.log(err)
      })
      .finally(spinner.stop)
  }

  function doSignUpSocial(email, nickName, socialId, image, token, hasCommerce) {
    spinner.start()
    const profile = {email, nickName, socialId, imageName: image, token}
    userService.signUpSocial(email, nickName, socialId, image, hasCommerce)
      .then((userDB) => {
        userService.signInSocialNetworking('facebook', profile)
          .then((userData) => {
            $window.fbq('track', 'CompleteRegistration')
            userService.saveUserData(userData)
            $ctrl.redirect(userData)
          })
      })
      .catch(err => {
        $window.fbq('track', 'CompleteRegistrationError')
        //40420 USER_DOESNOT_EXISTS
        if (err.data && err.data.code == 40420){
          modalMessageService.error(err.data.description, '')
        }else {
          errorService.handle(err)
        }

      })
      .finally(spinner.stop)
  }

  $ctrl.redirect = (data, signUp = false) => {
    if (data.hasCommerce) {
      $state.go("addcommerce")
    } else {
      if (signUp && localStorageService.get('quote_data')){
        $state.go("steps", { existingQuoteData : true })
      } else {
        $state.go("board.user.cars")
      }
    }
  }

  $ctrl.goToLogin = () => {
    $state.go("login")
  }

}
