'use strict'

angular.module('amApp').component('userBudgetItem', {
  controller: UserBudgetItemController,
  templateUrl: "dashboard-user/views/tab-quotes/user-budget-item.html",
  bindings: {
    budget: '<',
    updatePage: '<',
    currentFilter: '<'
  }
})

function UserBudgetItemController($http, quoteService, modalMessageService, $state, $scope, locationService, errorService, MAX_COMMENT_LENGTH, $window, userService, paymentService) {
  var $ctrl = this

  $ctrl.dataUser = userService.getUserData()


  $ctrl.getMaxCommentLength = () => {
    return MAX_COMMENT_LENGTH;
  }

  $ctrl.isCommentMaxLength = (comment) => {
    return comment.length > MAX_COMMENT_LENGTH;
  }

  $ctrl.getLocationParsed = (location) => {
    return locationService.getAddressLine(location)
  }

  $ctrl.$onInit = ()=>{
  }

  $ctrl.acceptRequestBudget = (quoteId, replyId, commerceId) => {
    saveStatus('accepted', quoteId, replyId, commerceId);
  }

  $ctrl.rejectRequestBudget = (quoteId, replyId, commerceId) => {
    saveStatus('refused', quoteId, replyId, commerceId);
  }

  $ctrl.finishRequestBudget = (quoteId, replyId) => {
    saveStatus('finished', quoteId, replyId);
  }

  $ctrl.voucherRequestBudget = budget => {
    $.LoadingOverlay('show')
    $http({
      method: 'POST',
      url: '/print-voucher',
      data: JSON.stringify(budget),
      headers: {'Content-Type': 'application/json'}
    }).then(voucherHtml => {
      $.LoadingOverlay('hide', true)
      $window.fbq('track', 'dashboardUserQuoteVoucher')
      printHtml(voucherHtml.data)
    })
  }

  $ctrl.goProfileCommerce = (commerceId) => {
    var url = $state.href('profile_commerce', { commerceId: commerceId})
    window.open(url,'_blank')
  }

  $ctrl.askToCommerce = (commerceId) => {
    $state.go('profile_commerce_comments', { commerceId: commerceId})
  }

  //customer's always asking for a product to buy in this case.
  $ctrl.goProductDetail = (commerceId, productId, quoteId, replyId) => {
    $state.go('product_detail', {commerceId: commerceId, productId: productId, quoteId : quoteId, quoteReplyId : replyId})
  }

  $ctrl.qualifyRequestBudget = (quoteId) => {
    $state.go('quote_rating', { quoteId: quoteId })
  }

  const printHtml = function (html) {
    const printWindow = window.open()
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }


  $ctrl.acceptAndBuyRequestBudget = (quote, reply) => {
    paymentService.getCheckoutLinkQuote(quote, reply, 0)
      .then(checkoutLink => {
        $window.location.href = checkoutLink
        $.LoadingOverlay('hide', true)
      })
      .catch((err) => {
        if (err.data && err.data.code == 40416) {
          modalMessageService.error('Atención', 'El comercio no tiene una cuenta de Mercado Pago asociada. Envía un mensaje al whatsapp de Autominuto y en instantes resolveremos el problema ')
        }else {
          errorService.handle(err)  
        }

        $.LoadingOverlay('hide', true)
    })
  }

  function saveStatus(status, quoteId, replyId, commerceId){
    $.LoadingOverlay("show")
    quoteService.saveStatus(quoteId, replyId, commerceId, status)
    .then((data) => {
      $ctrl.updatePage()
      $window.fbq('track', 'dashboardUserQuoteRepliedBudget'+status)
      if (status == 'accepted'){
        modalMessageService.success(
          'El pedido fue aceptado con éxito',
          'Podrás encontrar todos los datos para comunicarte con el comercio en "Aceptados". ' +
          'Una vez en el local, mencioná que llegaste a través de Autominuto.' , null)
      }
    })
    .catch(err => {
      $window.fbq('track', 'dashboardUserQuoteRepliedBudget'+status+'Error')
      errorService.handle(err)
    })
    .then(() => {
      $.LoadingOverlay("hide")
    })
  }

  $ctrl.getMainTitle = (quoteType) => {
    if(quoteType === "TURN_REQUEST") {
      return "Pedido de turno"
    }
    return "Pedido de cotización"
  }


}
