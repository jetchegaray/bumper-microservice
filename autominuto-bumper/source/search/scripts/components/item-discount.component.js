'use strict'

angular.module('amApp').component('resultsItemDiscount', {
  templateUrl: 'search/views/item-discount.html',
  controller: itemDiscountCtrl,
  controllerAs: '$ctrl',
  bindings: {
    commerceId: '<',
    commerceSlug: '<',
    services: '<',
    code: '<',
    discountPercentage: '<',
    discountFixed: '<',
    price: '<'
  }
})

function itemDiscountCtrl($state) {

  const $ctrl = this


  $ctrl.getDiscount = () => {
    if($ctrl.discountFixed) {
      let discountTemp = (($ctrl.price - $ctrl.discountFixed)/$ctrl.price)*100
      return Math.round(discountTemp)
    } else {
      return $ctrl.discountPercentage
    }
  }

  $ctrl.getServiceSummary = () => {
     let cad = ""
    if($ctrl.services.length) {
        let temp = []
        angular.forEach($ctrl.services, function(item) {
          temp.push(item.name)
        })
        cad = temp.join(', ');
        if($ctrl.services.length > 1) {
          let position = cad.lastIndexOf(',')
          cad = cad.substring(0, position) + ' y ' + cad.substring(position + 1)
        }
    }
    return cad.toString()
  }

  $ctrl.goToCoupons = () => {
    var url = $state.href('profile_commerce_coupons', {commerceSlug : $ctrl.commerceSlug, commerceId: $ctrl.commerceId})
    window.open(url,'_blank')
  }

}
