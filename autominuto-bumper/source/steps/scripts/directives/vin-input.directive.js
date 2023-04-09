'use strict'

angular.module('amApp').directive('vinInput', () => {
  return {
    scope: {
	  bindedModel: "=ngModel"
	},
	templateUrl: 'steps/views/vin-input.html',
    
    link: function() {
      $('.tt_reg').tooltip()
      $('.tt_large').tooltip({
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner large"></div></div>',
      })
    },
  }
})