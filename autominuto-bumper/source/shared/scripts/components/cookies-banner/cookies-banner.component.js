'use strict'

angular
  .module('amApp').component('cookiesBanner', {
    templateUrl: 'shared/views/cookies-banner/cookies-banner.html',
    controller: CoockiesBannerController,
    bindings: {
    }
})
function CoockiesBannerController(userService) {
    var $ctrl = this

    $ctrl.$onInit = () => {
    }
    $ctrl.disabledPaths = [
        '/registro-completo',
        '/login',
        '/buscar-comercio',
        '/alta-comercio',
        '/validar-comercio',
        '/error'
    ]
    $ctrl.setCookiesBannerVisibility = function (option) {
        userService.setUserCookiesBannerVisibility(option)
    }
    $ctrl.getCookiesBannerVisibility = function () {
        return userService.getUserCookiesBannerVisibility()
    }
}