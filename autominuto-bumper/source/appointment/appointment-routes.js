'use strict'

angular.module('amApp').config(manageAppointmentRoutes)

function manageAppointmentRoutes($stateProvider) {
  $stateProvider
    .state('ask_appointment',{
      url: '/comercio/:commerceId/:commerceSlug/:serviceSlug',
      templateUrl: 'appointment/views/appointment.html',
      controller : 'AppointmentController as $ctrl',
      params: {
        saveAppointment: null
      }
    })
}
