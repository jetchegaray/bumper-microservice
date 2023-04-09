'use strict'

angular.module('amApp').controller('UserController', UserController)

function UserController(
  errorHandler,
  localStorageService,
  errorService,
  redirectService,
  spinner,
  userService,
  commerceService,
  $auth,
  $scope,
  $state,
  $stateParams,
  $location,
  $timeout,
  modalMessageService) {

  const $ctrl = this

  $scope.validateForm = {
    'nickname': {'min': 6, 'max': 12},
    'password': {'min': 6, 'max': 20, 'pattern': '[a-zA-Z0-9_\.]+'},
  }

  $scope.email = $stateParams.email
  $scope.changePasswordParam = $stateParams.changePasswordParam
  $scope.passwordType = 'password'

  $scope.user = {}
  $scope.user.cars = [1, 2, 3]
  $scope.errorMessage = null

  $ctrl.$onInit = () => {
    if ($stateParams.token && $stateParams.salt) {
      activateAccount()
    }
  }

  function doSignUpSocial(email, nickName, socialId, image, token) {
    spinner.start()
    const profile = {email, nickName, socialId, imageName: image, token}
    userService.loginSocial(email, nickName, socialId, image)
      .then((userDB) => {
        userService.signInSocialNetworking('facebook', profile)
          .then((userData) => {
            userService.saveUserData(userData)
            const callback = $stateParams.callback ? $stateParams.callback.action : Promise.resolve.bind(Promise)
              
            callback().then(() => {
              $scope.goPendingQuotes()
              $scope.savePendingCommerce().then(() => {
                spinner.stop()
                redirectService.redirect()
              })
            })
          })
      })
      .catch(err => {
        //40420 USER_DOESNOT_EXISTS
        if (err.data && err.data.code == 40420){
          modalMessageService.error(err.data.description, '')
        }else {
          errorService.handle(err)
        }
        spinner.stop()
      })
  }

  $scope.authenticateFacebook = () => {
    FB.login((auth) => {
      if (auth.status === 'connected') {
        FB.api('/me?fields=name, email, picture, first_name', (profile) => {
          let userImage = profile.picture && profile.picture.data ? profile.picture.data.url : ''
          FB.api(`/${profile.id}/picture?redirect=false&type=large`, (pictureResponse) => {
            if (pictureResponse && !pictureResponse.error) {
              userImage = pictureResponse.data ? pictureResponse.data.url : userImage
            }
            doSignUpSocial(profile.email, profile.first_name, profile.id, userImage, auth.authResponse.accessToken)
          })
        })
      }
    }, {scope: 'public_profile,email'})
  }

  $scope.authenticate = (provider, userParams) => {
    spinner.start()
    $auth.authenticate(provider, userParams)
      .then(res => {
        userService.saveUserData(res.data)
        const callback = $stateParams.callback ? $stateParams.callback.action : Promise.resolve.bind(Promise)

        callback().then(() => {
          $scope.goPendingQuotes()
          $scope.savePendingCommerce().then(() => {
            redirectService.redirect()
            spinner.stop()
          })
        })
      })
      .catch(err => {
        //40420 USER_DOESNOT_EXISTS
        if (err.data && err.data.code == 40420){
          modalMessageService.error(err.data.description, '')
        }else {
          errorService.handle(err)
        }
        spinner.stop()
      })
  }

  $scope.signIn = () => {

    if (!$scope.userForm.$valid) {
      return
    }

    spinner.start()
    NicknameOrEmail($scope.user.nickNameOrEmail)

    userService.signIn($scope.user)
      .then(() => {
        const callback = $stateParams.callback ? $stateParams.callback.action : Promise.resolve.bind(Promise)
        
        callback().then(() => {
          $scope.goPendingQuotes()
          $scope.savePendingCommerce().then(() => {
            redirectService.redirect()
            spinner.stop()
          })
        })
      })
      .catch(err => {
        //40420 USER_DOESNOT_EXISTS
        if (err.data && err.data.code == 40420){
          modalMessageService.error(err.data.description, '')
        }else {
          errorService.handle(err)
        }
        spinner.stop()
      })
  }


  $scope.savePendingCommerce = () => new Promise(resolve => {
    const commerceToSave = localStorageService.get('commerceToSave')

    if (commerceToSave) {
      const commerceId = commerceToSave.commerceId
      if (commerceId) {
        commerceService.modifyCommerce(userService.getUserData().id, commerceId, {
          commerce: commerceToSave.commerce,
//          categories: commerceToSave.categories,
          typeImages: commerceToSave.typeImages
        }, commerceToSave.images.map(base64ToFile)).then(() => {
          localStorageService.remove('commerceToSave')
          redirectService.setNextState('plans', {commerceId})
          resolve()
        })
      } else {
        commerceService.saveCommerce(userService.getUserData().id, {
          commerce: commerceToSave.commerce,
  //        categories: commerceToSave.categories,
          typeImages: commerceToSave.typeImages
        }, commerceToSave.images.map(base64ToFile)).then(res => {
          localStorageService.remove('commerceToSave')
          redirectService.setNextState('plans', {commerceId: res.commerceId})
          resolve()
        })
      }
    } else {  
      resolve()
    }
  })


  $scope.goPendingQuotes = () => {
    const quotePending = localStorageService.get('quote_data')
    const commerceToSave = localStorageService.get('commerceToSave')
    
    // if user safe a quote and a commerce ..  no matter the quote. always redirect to the flow of the commerce
    if (quotePending && !commerceToSave) { 
      redirectService.setNextState('steps.one')
    }
  }

  $scope.cleanErrorMessage = function() {
    $scope.errorMessage = null
  }

  $scope.goToRegister = function() {
    if (localStorageService.get('commerceToSave')){
      $state.go("register_commerce")
    }else {
      $state.go("register")
    }
  }

  $scope.togglePassword = () => {
    if ($scope.passwordType == 'password') {
      $scope.passwordType = 'text'
    } else {
      $scope.passwordType = 'password'
    }
  }

  $scope.onKeydown = (event) => {
    var s = String.fromCharCode(event.which);
    if (s.toUpperCase() === s && s.toLowerCase() !== s && !event.shiftKey ) {
      $('.tootiop-caps-lock').addClass('tooltip-gen-auto');
      $timeout(
        function () {
            $('.tootiop-caps-lock').removeClass('tooltip-gen-auto');
        }, 5000 //it has to match with seconds "animation: cssAnimation 5s forwards" in /source/shared/styles/tooltip/tooltip-gen.scss
      );
    }
  }

  $ctrl.redirectToNext = () => {
    if ($stateParams.next) {
      $state.go($stateParams.next, JSON.parse($stateParams.params))
    } else {
      $state.go('home')
    }
  }

  /*
  NicknameOrEmail: Distinguishes between email and the nickname
  */
  function NicknameOrEmail(text) {
    var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (text.match(emailPattern) != null) { //  is email
      $scope.user.email = text
      $scope.user.nickName = null
    } else { // is nickname
      $scope.user.email = null
      $scope.user.nickName = text
    }
  }

  function activateAccount() {
    spinner.start()
    userService.activateAccountByToken($stateParams.token, $stateParams.salt)
      .then(() => {
        userService.setUserInactiveBannerVisibility(false)
        modalMessageService.success('Tu cuenta fue activada exitosamente !!', '')
      })
      .catch(error => errorService.handle(error))
      .finally(spinner.stop)
  }

  const base64ToFile = base64 => {
    if (base64) {
      const arr = base64.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      //second parameter is the name of the image. If i use the same name always. the id in nodejs at saving time will be the same. so bug equals images
      function chr4(){
        return Math.random().toString(16).slice(-4);
      }  
      //728bb9221e13f952192bc243fcd4c388
      return new File([u8arr], chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4(), {type: mime});
    } else {
      return null
    }
  }

}

angular.module('amApp').directive('nxEqualEx', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, model) {
      if (!attrs.nxEqualEx) {
        return
      }
      scope.$watch(attrs.nxEqualEx, function(value) {
        // Only compare values if the second ctrl has a value.
        if (model.$viewValue !== undefined && model.$viewValue !== '') {
          model.$setValidity('nxEqualEx', value === model.$viewValue)
        }
      })
      model.$parsers.push(function(value) {
        // Mute the nxEqual error if the second ctrl is empty.
        if (value === undefined || value === '') {
          model.$setValidity('nxEqualEx', true)
          return value
        }
        var isValid = value === scope.$eval(attrs.nxEqualEx)
        model.$setValidity('nxEqualEx', isValid)
        return isValid ? value : undefined
      })
    },
  }
})
