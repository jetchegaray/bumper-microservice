'use strict'

angular.module('amApp').factory('recommendationService', recommendationService)

function recommendationService($http, API_END_POINT, miscellaneous, localStorageService) {

  return {
    save: save,
  }

  function save(commerceId, recommendation) {
    const userId = localStorageService.get('userId')
    return $http.post(`${API_END_POINT}recommendation/save?commerceId=${commerceId}&userId=${userId}`, {recommendation : recommendation}).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}