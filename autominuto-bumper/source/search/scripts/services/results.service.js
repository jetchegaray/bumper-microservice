'use strict'

angular.module('amApp').factory('resultsService', resultsService)

function resultsService($http, API_END_POINT) {

  return {
    search: search,
    getBrands: brands,
    issues: issues,
    getBrandImage: getBrandImage,
  }

  function getBrandImage(brandId) {
    return $http.get(`${API_END_POINT}search/brand/${brandId}`).then(responseHandler)
  }

  function search(params, page = 1, orderBy = 1) {
    return $http.put(`${API_END_POINT}search?page=${page}&orderBy=${orderBy}`, params).then(responseHandler)
  }

  function brands() {
    return $http.get(`${API_END_POINT}search/brands`).then(responseHandler)
  }

  function issues() {
    return $http.get(`${API_END_POINT}search/issues`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
