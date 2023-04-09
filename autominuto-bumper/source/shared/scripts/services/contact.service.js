'use strict'

angular.module('amApp').factory('contactService', contactService)

function contactService(API_END_POINT, errorHandler, $http) {

  const responseHandler = errorHandler.responseHandler

  return {
    suscribeToNewsletter: suscribeToNewsletter,
    sendMailAutominuto: sendMailAutominuto
  }

  function suscribeToNewsletter(email) {
    return $http.post(`${API_END_POINT}contact/suscribeNewsletter`, {email}).then(responseHandler)
  }

  function sendMailAutominuto(name, email, phone) {
    return $http.post(`${API_END_POINT}contact/autominuto`, {name, email, phone}).then(responseHandler)
  }
}
