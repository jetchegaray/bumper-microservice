 'use strict'

angular.module('amApp').component('paymentMethods', {
  templateUrl: 'shared/views/payment-methods/payment-methods.html',
  controller: PaymentMethodsController,
  bindings:{
    paymentMethodsObject: '=',
  }
})

function PaymentMethodsController(planService) {

	const $ctrl = this

	$ctrl.cards = ['todas', 'Visa', 'MasterCard', 'Cabal', 'Diners', 'American Express', 'Naranja', 
  '365', 'Club La Nacion', 'Santander', 'Itaú', 'Macro', 'Galicia', 'ICBC', 'Banco Ciudad', 'HSBC', 
  'Credicoop', 'Banco Comafi']
	$ctrl.installments = [1, 2, 3, 6, 9, 12, 18, 24, 36]	
	$ctrl.title = "Medios de pago que aceptas"
	$ctrl.cashLabel = "Efectivo"
	$ctrl.debitLabel = "Débito"
  $ctrl.transferLabel = "Transferencia"
	$ctrl.MPLabel = "Mercado Pago"
	$ctrl.creditLabel = "Crédito"
	$ctrl.promotions = []

	$ctrl.$onInit = () => { 
    if (!$ctrl.paymentMethodsObject){
      $ctrl.paymentMethodsObject = {}
      $ctrl.paymentMethodsObject.promotions = []
      $ctrl.paymentMethodsObject.promotions.push({})
    }else if (!$ctrl.paymentMethodsObject.promotions){
      $ctrl.paymentMethodsObject.promotions = []
      $ctrl.paymentMethodsObject.promotions.push({})       
    }       
	}

  $ctrl.addPromotion = () => {
    if ($ctrl.paymentMethodsObject.promotions.length < 10){
      $ctrl.paymentMethodsObject.promotions.push({})
    }
  }

  $ctrl.removePromotion = (promotion) => {
    var index = $ctrl.paymentMethodsObject.promotions.indexOf(promotion)
    if (index != 0) {
      $ctrl.paymentMethodsObject.promotions.splice(index, 1)
    }
  }


}
