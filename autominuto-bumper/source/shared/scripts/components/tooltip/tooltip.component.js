'use strict'

angular.module('amApp').component('tooltipGen', {
  templateUrl: 'shared/views/tooltip/tooltip-gen.html',
  controller: TooltipGenController,
  bindings: {
    position: '@',
    imagenPos: '@',
    text: '@',
    imageRute: '@',
    tittleText: '@',
    tooltipSize: '@', 
    bodyAlign: '@',
    closeButtonControl: '=',
    angText: '<',
    angTitle: '<'
  }
})

function TooltipGenController() {
  var $ctrl = this

  $ctrl.close = () => {
    $ctrl.closeButtonControl = true
  }
}
