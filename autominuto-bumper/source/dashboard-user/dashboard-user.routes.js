'use strict'

angular.module('amApp').config(dashboardUserRoutes)

function dashboardUserRoutes($stateProvider) {
  $stateProvider

    .state('board', {
      url: '/board'
    })

    .state('board.user', {
      url: '/user',
      templateUrl: 'dashboard-user/views/board-user.html',
      controller: 'UserDashboardController as $ctrl',
    })

    .state('board.user.profile',{
      url: '/profile',
      views: {
        area: {
          template: '<my-data-profile ' +
            'user-data="$ctrl.userData" ' +
            'show-modal-user-profile-callback="$ctrl.showModalUserData()" ' +
            'refresh-callback="$ctrl.refreshCallback()"></my-data-profile>' +
            '<user-addresses ' +
            'user-adresses="$ctrl.userAdresses" ' +
            'refresh-callback="$ctrl.refreshCallback()"></user-addresses>'
        },
      },
    })

    .state('board.user.cars', {
      url: '/cars',
      views: {
        area: {
          template: '<user-car user-cars="$ctrl.userCars" refresh-callback="$ctrl.refreshCallback()"></user-car>'
        }
      }
    })

    .state('board.user.quotes',{
      url: '/quotes/:filter',
      params: {
          filter: 'requested',
      },
      views: {
        area: {
          template: '<user-budget-tab></user-budget-tab>'
        },
      },
    })

    .state('board.user.coupon', {
      url: '/coupons',
      views: {
        area: {
          template: '<tab-user-coupons></tab-user-coupons>'
        },
      },
    })

    .state('board.user.comments', {
      url: '/comments',
      views: {
        area: {
          template: '<tab-user-comments></tab-user-comments>'
        },
      },
    })
    
    .state('board.user.cars_fastload', {
      url: '/cars/fastload',
      views: {
        area: {
          template: '<fast-load-cars refresh-callback="$ctrl.refreshCallback()"></fast-load-cars>'
        },
      },
    })
}
