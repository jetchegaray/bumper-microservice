'use strict'

angular.module('amApp').factory('notificationService', notificationService)

function notificationService(API_END_POINT, errorHandler, miscellaneous, $http) {

  //const responseHandler = errorHandler.responseHandler

  return {
    getNotificationCommerce: getNotificationCommerce,
  }

  // Public
  function getNotificationCommerce(userId) {
    return $http.get(`${API_END_POINT}notification/user/${userId}`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}