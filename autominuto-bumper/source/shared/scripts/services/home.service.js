'use strict'

angular.module('amApp').factory('homeService', homeService)

function homeService($http, API_END_POINT) {

  return {
    topOfficialBrandsCommerces: topOfficialBrandsCommerces,
    topCommerces: topCommerces,
    topAddressQuotes: topAddressQuotes,
    lastBetterRatings: lastBetterRatings,
    searchBrands: searchBrands,
    classifiedBrands: classifiedBrands,
    topServicesSpareParts: topServicesSpareParts,
    topCoupons : topCoupons,
  }
  
  
  function topOfficialBrandsCommerces() {
    return $http.get(`${API_END_POINT}home/topOfficialBrandsCommerces`).then(responseHandler)
  }

  function topCommerces() {
    return $http.get(`${API_END_POINT}home/topCommerces`).then(responseHandler)
  }

  function topAddressQuotes() {
    const userId = '-1'
    return $http.get(`${API_END_POINT}home/topAddressQuotes?userId=${userId}`).then(responseHandler)
  }

  function lastBetterRatings() {
    return $http.get(`${API_END_POINT}home/lastBetterRatings`).then(responseHandler)
  }

  function searchBrands() {
    return $http.get(`${API_END_POINT}home/searchBrands`).then(responseHandler)
  }

  function classifiedBrands() {
    return $http.get(`${API_END_POINT}home/classifiedBrands`).then(responseHandler)
  }

  function topServicesSpareParts() {
    return $http.get(`${API_END_POINT}home/topServicesSpareParts`).then(responseHandler)
  }

  function topCoupons() {
    return $http.get(`${API_END_POINT}home/topCoupons`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
