'use strict'

angular.module('amApp').component('couponCommerce', {
  templateUrl: 'dashboard-commerce/views/tab-coupons/coupon.html',
  controller: CouponController,
  bindings: {
    coupon: '<',
    showCoupon: '<',
    showEditCoupon: '<',
    showDeleteCoupon: '<',
    showBuyCoupon: '<',
    profile: '<'
  }
})

function CouponController() {
  var $ctrl = this

  $ctrl.getServiceSummary = () => {
    let cad = ""
    if($ctrl.coupon.services.length) {
        let temp = []
        angular.forEach($ctrl.coupon.services, function(item) {
          temp.push(item.name)
        })
        cad = temp.join(', ');
        if($ctrl.coupon.services.length > 1) {
          let position = cad.lastIndexOf(',')
          cad = cad.substring(0, position) + ' y ' + cad.substring(position + 1)
        }
    }
    return cad.toString()
  }

}
