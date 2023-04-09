'use strict'

angular.module('amApp').factory('commerceTypeService', commerceTypeService)

function commerceTypeService($http, API_END_POINT, miscellaneous, localStorageService) {

  return {
    getAll: getAll
  }


  function getAll() {
    return $http.get(`${API_END_POINT}commerceType/all`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}