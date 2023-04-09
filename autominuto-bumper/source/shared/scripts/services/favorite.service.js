'use strict'

angular.module('amApp').service('favoriteService', favoriteService)

function favoriteService($http, API_END_POINT) {
  return {
    save: save,
    isFavorite: isFavorite,
    remove: remove,
  }

  function isFavorite(userId, commerceId) {
    return $http.get(`${API_END_POINT}favorite/has?userId=${userId}&commerceId=${commerceId}`).then(responseHandler)
  }

  function save(userId, commerceId) {
    return $http.post(`${API_END_POINT}favorite/save?commerceId=${commerceId}&userId=${userId}`).then(responseHandler)
  }

  function remove(userId, commerceId) {
    return $http.post(`${API_END_POINT}favorite/remove?commerceId=${commerceId}&userId=${userId}`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
