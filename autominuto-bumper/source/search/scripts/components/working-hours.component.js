'use strict'

angular.module('amApp').component('workingHours', {
  templateUrl: 'search/views/working-hours.html',
  controller: workingHoursController,
  bindings: {
    day: '@',
    periods: '<',
  }
})

function workingHoursController() {

  const $ctrl = this

  $ctrl.closed = () => {
    return !$ctrl.periods || $ctrl.periods.length == 0
  }

  $ctrl.openAllDay = () => {
    return $ctrl.periods && $ctrl.periods.length == 1 && $ctrl.periods[0].open24 === true
  }
}