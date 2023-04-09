'use strict'

angular.module('amApp').component('extraFieldsInputText', {
  templateUrl: 'steps/views/extra-fields/extra-fields-input-text.html',
  controller: ExtraFieldsInputTextController,
  bindings: {
    component: '='
  }
})

function ExtraFieldsInputTextController() {

  const $ctrl = this

  $ctrl.$onInit = () => {

  }
}
