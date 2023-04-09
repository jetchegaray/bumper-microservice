'use strict'

angular.module('amApp').component('bannerCommerce', {
  templateUrl: 'dashboard-commerce/views/banner-commerce.html',
  controller: BannerCommerceController,
  bindings: {
    banner: '<',
    showPhone: '<',
    isProfile: '<',
    imageLogoName: '<'
  }
})

function BannerCommerceController($scope, modalMessageService, ModalService, commerceBrandService, COMMERCE, _, $state, $window) {
  var $ctrl = this

  const GOLD = 'gold'
  const DEFAULT = 'default'

  $ctrl.showWorkingHours = false
  $ctrl.showPhoneButton = true
  $ctrl.amountVisibleBrands = 4
  $ctrl.showWorkingHourLegend = false

  $ctrl.$onInit = function() {
    //change it when we have contracts.. no more GOLD
    $ctrl.showWorkingHourLegend = $ctrl.banner.workingHours != null && $ctrl.banner.workingHours != undefined &&
                                  $ctrl.banner.workingHours.periods != null && $ctrl.banner.workingHours.periods != undefined    
  }

  $ctrl.showNews = () => {
    modalMessageService.success('¡ Pronto tendremos novedades para ti !', '')
  }

  $ctrl.showBrands = () => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/popup-brands.html",
      inputs: {
        brands: $ctrl.banner.brands
      },
      controller:  function ($scope, brands, close) {
        $scope.brands = brands
        $scope.starting = $ctrl.amountVisibleBrands
      },
      preClose: (modal) => { modal.element.modal('hide') }
    }).then(function(modal) {
      modal.element.modal()
    })
  }


  $ctrl.shouldShowPhoneButton = () => {
    return _.filter($ctrl.banner.phones,  function(phone){ return !phone.acceptWhatsapp }).length > 0
  }

  $ctrl.getCommerceColorType = () => {
    return commerceBrandService.getCommerceColorType($ctrl.banner);
  }

  $ctrl.goToUserProfile = () => {
    $state.go('board.user.profile')
  }

  $ctrl.showedPhone = () => {
    $ctrl.showPhoneButton = false
    $window.fbq('track', 'ClikedShowPhoneButtonCommerce+'+$ctrl.banner.id)
  }


}
