'use strict'

angular.module('amApp').factory('searchCommerceService', searchCommerceService)

function searchCommerceService($http, API_END_POINT) {
  return {
    getCommerces: getCommerces
  }

  function getCommerces(data, page) {

    return $http.post(`${API_END_POINT}commerce/name?page=${page}`, {data: data}).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }

}
