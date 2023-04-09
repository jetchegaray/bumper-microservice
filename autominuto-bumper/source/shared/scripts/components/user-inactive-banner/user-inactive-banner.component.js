'use strict'

angular
  .module('amApp').component('userInactiveBanner', {
    templateUrl: 'shared/views/user-inactive-banner/user-inactive-banner.html',
    controller: UserInactiveBannerController,
    bindings: {
    }
})
function UserInactiveBannerController(userService, $state, localStorageService, $location, USER_INACTIVE_BANNER_EXPIRATION) {
    var $ctrl = this

    $ctrl.$onInit = () => {
        $ctrl.userData = userService.getUserData()
        $ctrl.lastEnter = localStorageService.get('lastEnter')
        $ctrl.now = moment().local()
    }
    $ctrl.disabledPaths = [
        '/',
        '/registro-completo',
        '/login',
        '/buscar-comercio',
        '/alta-comercio',
        '/validar-comercio',
        '/error'
    ]
    $ctrl.setVisibility = function (option) {
        $ctrl.lastEnter = userService.setUserInactiveBannerVisibility(option)
    }
    $ctrl.getVisibility = function () {
        let optionExpired = $ctrl.now.diff($ctrl.lastEnter, 'minutes') > USER_INACTIVE_BANNER_EXPIRATION
        return userService.getUserInactiveBannerVisibility(optionExpired)
    }
    $ctrl.validPath = function () {
        return $ctrl.disabledPaths.filter(function(path){return $location.$$path == path }).length === 0
    }
    $ctrl.goToRegisterComplete = function () {
        $state.go("register_complete", {email : $ctrl.userData.email, userId: $ctrl.userData.id})
    }
}