'use strict'

angular.module('amApp').factory('serviceTypeService', serviceTypeService)

function serviceTypeService($http, API_END_POINT) {

  return {
    getAll: getAll,
    getAllWithDetails: getAllWithDetails,
  }

  function getAll() {
    return $http.get(`${API_END_POINT}serviceType/all`).then(responseHandler)
  }

  function getAllWithDetails() {
    return $http.get(`${API_END_POINT}serviceType/allWithDetails`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}