'use strict'

angular.module('amApp').component('extraFieldsCheckBox', {
  templateUrl: 'steps/views/extra-fields/extra-fields-check-box.html',
  controller: ExtraFieldsCheckBoxController,
  bindings: {
    component: '='
  }
})

function ExtraFieldsCheckBoxController() {

  const $ctrl = this

  $ctrl.$onInit = () => {
  //   $ctrl.selection = []

  //   _.each($ctrl.component.options, b => { 
  //     $ctrl.selection[b.name] = false
  //   })
  // }
  }
}
