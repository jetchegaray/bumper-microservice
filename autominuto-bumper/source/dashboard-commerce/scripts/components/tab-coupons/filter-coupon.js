'use strict'

angular.module('amApp').component('filterDashboardCommerce', {
  templateUrl: 'dashboard-commerce/views/tab-coupons/coupon-filter.html',
  controller: filterCouponController,
  bindings: {
    updateSortByDscto: '<',
    filterStates: '=',
    addCoupon: '<',
    profile: '<'
  }
})

function filterCouponController() {
  var $ctrl = this

//  $ctrl.dsctos =[{order: true, text: 'Mayor descuento'}, {order: false, text: 'Menor descuento'}]
//  $ctrl.type = $ctrl.dsctos[0]
}
