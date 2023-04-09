'use strict'

angular.module('amApp').config(dashboardCommerceRoutes)

function dashboardCommerceRoutes($stateProvider) {
  $stateProvider

    .state('board.commerce', {
      url: '/commerce/:commerceId',
      templateUrl: 'dashboard-commerce/views/board-commerce.html',
      controller: 'CommerceDashboardController as $ctrl',
      params: {
        showAddCommerceTour : false,
        goToPlans : false
      }
    })

    .state('board.commerce.quotes', {
      url: '/quotes?plan&state',
      views: {
        main: {
          template: '<commerce-budget-tab ' +
            'get-data-commerce="$ctrl.getSimpleCommerceData"' +
            '></commerce-budget-tab>'
        }
      }
    })

    .state('board.commerce.shop', {
      url: '/products',
      views: {
        main: {
          template: '<store-tab commerce-services="$ctrl.banner.services"></store-tab>'
        },
      }
    })

    .state('board.commerce.coupon', {
      url: '/coupons',
      views: {
        main: {
          template: '<tab-coupons commerce-services="$ctrl.banner.services"></tab-coupons>'
        }
      }
    })

    .state('board.commerce.comments', {
      url: '/comments',
      views: {
        main: {
          template: '<tab-comments get-data-commerce="$ctrl.getSimpleCommerceData" is-profile="false"></tab-comments>'
        }
      }
    })

    .state('board.commerce.profile', {
      url: '/profile',
      views: {
        main: {
          template: '<add-validate-commerce complete-page="false" image-logo-name="$ctrl.imageLogoName"></add-validate-commerce>'
        }
      },
      params: {
        goToPlans : false
      }
    })

    .state('board.commerce.shop_fastload', {
      url: '/board/commerce/:commerceId/products/fastload',
      templateUrl: 'dashboard-commerce/views/fastload/fast-load-store-commerce.html',
      controller: 'FastLoadCommerceController as $ctrl'
    })
}
