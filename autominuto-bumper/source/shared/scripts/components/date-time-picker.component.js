'use strict'

angular.module('amApp').component('dateTimePicker', {
  templateUrl: 'shared/views/date-time-picker.html',
  controller: DateTimePickerController,
  bindings: {
    datetimes: '='
  }
})

function DateTimePickerController() {
  var $ctrl = this

  $ctrl.minDatetime = moment()

  $ctrl.timeSelectable = function (time) {
    return 7 <= time.hour() && time.hour() <= 20
  }

  $ctrl.removeDatetime = function(datetime) {
    var index = $ctrl.datetimes.indexOf(datetime)
    if (index != 0) {
      $ctrl.datetimes.splice(index, 1)
    }
  }

  $ctrl.addDatetime = function() {
    if ($ctrl.datetimes.length < 3){
      $ctrl.datetimes.push({})
    }
  }

}
