'use strict'

angular.module('amApp').component('extraFieldsRadioButton', {
  templateUrl: 'steps/views/extra-fields/extra-fields-radio-button.html',
  controller: ExtraFieldsRadioButtonController,
  bindings: {
    component: '='
  }
})

function ExtraFieldsRadioButtonController() {

  const $ctrl = this

  $ctrl.$onInit = () => {

  }
}
