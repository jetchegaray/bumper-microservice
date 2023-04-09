 'use strict'

angular.module('amApp').component('promotionalCode', {
  templateUrl: 'shared/views/promotional-code/promotional-code.html',
  controller: PromotionalCodeController,
  bindings:{
    onSuccess: '&'
  }
})

function PromotionalCodeController(planService) {

	const $ctrl = this
	$ctrl.disabled = false

	$ctrl.validateCode = () => {
	    if($ctrl.code){
	    	$ctrl.disabled = true
	    	planService.validate($ctrl.code)
			.then(data => {
				$ctrl.discountAmount = data.discount
				$ctrl.discountAmount ? $ctrl.validCode = true : $ctrl.validCode = false
        		$ctrl.onSuccess({discount: $ctrl.discountAmount, code: $ctrl.code})
			})
			.catch(err => {
				$ctrl.validCode = false
			})
			.then(() => {
				$ctrl.disabled = false
			})
	    } else {
	    	$ctrl.validCode = false
	    }

  	}

}
