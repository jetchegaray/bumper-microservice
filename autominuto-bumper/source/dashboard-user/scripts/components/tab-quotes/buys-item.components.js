'use strict'

angular.module('amApp').component('buysItem', {
  controller: BuysItemController,
  templateUrl: "dashboard-user/views/tab-quotes/buys-item.html",
  bindings: {
    buy: '<',
    updatePage: '<',
    buysItems: '<'
  }
})

function BuysItemController($http, $scope, $state) {
  var $ctrl = this

  $ctrl.$onInit = ()=>{

  }

  $ctrl.getMainTitle = (product) => {
    if(product.service) {
      return "Compra de servicio"
    } else {
      return "Compra de producto"
    }
  }

  $ctrl.rateBuy = (paymentId) => {
	  $state.go('bought_rating', { paymentId: paymentId })
  }


  $ctrl.voucherProductRequestBudget = bought => {
    $.LoadingOverlay('show')
    $http({
      method: 'POST',
      url: '/print-voucher-product',
      data: JSON.stringify(bought),
      headers: {'Content-Type': 'application/json'}
    }).then(voucherHtml => {
      printHtml(voucherHtml.data);
      $.LoadingOverlay('hide', true)
    })
  }

  const printHtml = function (html) {
    const printWindow = window.open()
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

}