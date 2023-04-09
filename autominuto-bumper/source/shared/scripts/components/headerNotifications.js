'use strict'

angular.module('amApp').component('headerNotification', {
  templateUrl: 'shared/views/header-notification.html',
  controller: HeaderNotificationController,
  bindings: {
  }
})

function HeaderNotificationController($scope, $auth, userService, notificationService, stepsHandler, $state, localStorageService, errorService, commerceService) {
  var $ctrl = this
  $ctrl.notifications = []
  $ctrl.totalNotifications = 0
  $ctrl.showPanelNotification = false
  $ctrl.userData = {}

  $ctrl.$onInit = () => {

    const user = userService.getUserData();

    if (user.id) {
      userService
        .getCommerces(user.id)
        .then((commerces) => {
          commerces = commerces.data;
          if (user.hasCommerce && commerces.length) {
            $ctrl.myCommerce = commerces[0];
            $ctrl.myCommerceId =  $ctrl.myCommerce.id;
          }
        }); 
    
      userService
        .userView(user.id)
        .then(response => {
          $ctrl.userData = response;
          $ctrl.userAdresses = response.addresses;
          $ctrl.userCars = response.cars;
          $ctrl.userData.profilePercentage = userService.calculatePercentageProfile($ctrl.userData);
        })
        .catch(err  => errorService.handle(err))
    }


    let userLastEnterTime = localStorageService.get('lastEnter')
    let lastEnterDate = moment(userLastEnterTime).format('DD-MM-YYYY hh:mm')

    if ($ctrl.userData && $ctrl.userData.lastLogin){
      let lastLogin = moment($ctrl.userData.lastLogin,'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm')
      if (userLastEnterTime && lastLogin <= lastEnterDate){
        notificationService.getNotificationCommerce($ctrl.userData.id).then((data) => {
          $ctrl.notifications = data
          $ctrl.totalNotifications = data.length
        }).catch(err => {
          console.log("respuesta incorrecta del controlador Header :")
        })
      }
    }
    localStorageService.set('lastEnter', moment().local())
    $ctrl.imageLink = $ctrl.userData.image

  }

  $ctrl.isLogged = function () {
    return userService.authenticated() && $ctrl.userData != null
  }

  $scope.$watch(function () { return localStorageService.get("image") },function(newVal,oldVal){
    if(oldVal!==newVal && newVal !== undefined){
      $ctrl.imageLink = localStorageService.get("image")
    }
  })

  $ctrl.logout = function () {
    userService.logout()
    stepsHandler.clearAll()
  }

  $ctrl.updateStatePanelNotification = (state) => {
    $ctrl.showPanelNotification = state
  }

  $ctrl.goToProfile = () => {
    if ($ctrl.userData.hasCommerce && $ctrl.myCommerceId)
      $state.go('board.commerce.quotes', { commerceId: $ctrl.myCommerceId})
    else
      $state.go('board.user.profile')
  }

  $ctrl.goToLogin = () => {
    $state.go("login")
  }

  $ctrl.goToLanding = () => {
    $state.go("vendemas")
  }
}
