'use strict'

angular.module('amApp').component('bannerUser', {
  templateUrl: 'dashboard-user/views/banner-user.html',
  controller: BannerUserController,
  bindings: {
    banner: '<',
    percentProfile: '<',
    refreshCallback: '&',
    myCommerceId: '<',
    showModalUserProfileCallback: '&'
  }
})

function BannerUserController($state,userService) {
  var $ctrl = this
  $ctrl.showWorkingHours = false
  $ctrl.showPhoneButton = true
  $ctrl.amountVisibleBrands = 4

  $ctrl.goToMyCommerce = () => {
    //  var url = $state.href('board.commerce.quotes', { commerceId: $ctrl.myCommerceId})
    //  window.open(url,'_blank')
    $state.go('board.commerce.quotes', { commerceId: $ctrl.myCommerceId})
  }
  
  $ctrl.goToAddCommerce = () => {
    $state.go('addcommerce')
  }
}
