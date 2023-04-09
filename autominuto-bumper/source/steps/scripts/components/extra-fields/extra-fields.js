'use strict'

angular.module('amApp').component('extraFields', {
  templateUrl: 'steps/views/extra-fields/extra-fields-base.html',
  controller: ExtraFieldsController,
  bindings: {
    option: '=',
    productIncludedChecked: '=',
    fullWidth: '='
  }
})

function ExtraFieldsController($scope, EXTRA_FIELDS) {

  const $ctrl = this

  $ctrl.$onInit = () => {
    $ctrl.fieldTypes = EXTRA_FIELDS
  }

  /* $scope.$watch('$ctrl.option', () => {
     console.log($ctrl.option)
   })*/
}
