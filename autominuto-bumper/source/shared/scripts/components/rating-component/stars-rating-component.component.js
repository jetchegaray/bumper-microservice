 'use strict'

angular.module('amApp').component('starsRatingCalification', {
  templateUrl: 'shared/views/rating-component/tmpl-stars-icon-comp.html',
  controller: StartsRatingComponentController,
  bindings:{
    rating: '=',
    showRatingText: '@'
  }
})

function StartsRatingComponentController() {

	const $ctrl = this
	
	$ctrl.$onInit = () =>{
		switch (true) {
      case ($ctrl.rating > 4.4):
				$ctrl.calificationName = "Excelente"
				$ctrl.color = "excelent"
				break;
		  case ($ctrl.rating > 3.4):
				$ctrl.calificationName = "Muy Bueno"
				$ctrl.color = "excelent"
				break;
			case ($ctrl.rating > 2.4):
				$ctrl.calificationName = "Bueno"
				$ctrl.color = "good"
				break;
			default:
				$ctrl.calificationName = "Regular"
				$ctrl.color = "regular"

        }
		
	}
	

}
