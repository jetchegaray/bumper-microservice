'use strict'

angular.module('amApp').component('tabUserCoupons', {
  templateUrl: 'dashboard-user/views/tab-coupons/tab-coupons.html',
  controller: TabUserCouponsController
})

function TabUserCouponsController($http, $timeout, ModalService, couponService, homeService, $scope, localStorageService, errorService) {
  var $ctrl = this
  $ctrl.coupons = []
  $ctrl.currentPage = 0
  $ctrl.totalPages = 0
  $ctrl.formatDate = "DD-MM-YYYY hh:mm"

  $ctrl.isLoadingCoupons = true
  $ctrl.filterStates = {
    showPack: true,
    showCoupons: true
  }

  $ctrl.orderByParam = "discount"
  $ctrl.currentOrder = true // true: asc, false: desc

  $ctrl.$onInit = function () {
    $.LoadingOverlay("show")
    const userId = localStorageService.get("userId")
    const page = 1

    const couponsRequest = couponService.getCouponsByUser(userId, page)
      .then(data => {
        $ctrl.currentPage = page
        $ctrl.totalPages = data.pages
        $ctrl.coupons = data.coupons
        $ctrl.isLoadingCoupons = false
    })

    Promise.all([couponsRequest]).then(() => {
      $.LoadingOverlay('hide', true)
    }).catch(err => {
      errorService.handle(err)
    })
  }


  $ctrl.updateSortByDscto = () => {
    $ctrl.currentOrder = !$ctrl.currentOrder
  }

  $ctrl.applyCouponFilter = coupon => {
    if ($ctrl.filterStates.showPack === true && $ctrl.filterStates.showCoupons === true)
      return true
    if ($ctrl.filterStates.showPack === false && $ctrl.filterStates.showCoupons === false)
      return false
    if ($ctrl.filterStates.showPack === true && $ctrl.filterStates.showPack == coupon.isPack)
      return coupon
    if ($ctrl.filterStates.showCoupons === true && coupon.isPack == false)
      return coupon
  }

  $ctrl.loadPage = (page) => {
    if (page === $ctrl.currentPage) return

    $ctrl.getCouponsByPage(page)
  }

  const printHtml = function (html) {
    const printWindow = window.open()
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  $ctrl.printCoupon = (coupon) => {
    $.LoadingOverlay("show")
    $http({
      method: 'POST',
      url: '/print-coupon',
      data: coupon,
      headers: {'Content-Type': 'application/json'}
    }).then((couponHtml) => {
      printHtml(couponHtml.data);
      $.LoadingOverlay('hide')
    })
  }

  $ctrl.showCoupon = (coupon) => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-coupons/popups/show-coupon.html",
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      windowClass: 'my-modal',
      inputs: {
        coupon: coupon
      },
      controller: 'ShowCouponAmModalController'
    }).then(function (modal) {
        modal.element.modal();
      });
  }


}
