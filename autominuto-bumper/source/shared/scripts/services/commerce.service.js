'use strict'

angular.module('amApp').factory('commerceService', commerceService)

function commerceService($http, API_END_POINT, miscellaneous, Upload, COMMERCE) {
  return {
    commerces: commerces,
    saveCommerce: saveCommerce,
    quickSaveCommerce: quickSaveCommerce,
    modifyCommerce: modifyCommerce,
    // quickModifyCommerce: quickModifyCommerce,
    commentCommerce: commentCommerce,
    findOwnerCommerce: findOwnerCommerce,
    findCommerce: findCommerce,
    findCommerceWithCategoriesDetails: findCommerceWithCategoriesDetails,
    getCommerceData: getCommerceData, // unformatted
    searchCommerces: searchCommerces,
    ratingCommerce: ratingCommerce,
    getAllComments: getAllComments,
    getCommerceMap: getCommerceMap,
    getRecomendation: getRecomendation,
    saveQuestionFrom : saveQuestionFrom,
    existsInLocation : existsInLocation,
    claimCommerce: claimCommerce,
    hasClaimCommerce: hasClaimCommerce,
    productsAndCoupons: productsAndCoupons,
  }

  function getRecomendation(commerceId) {
    return $http.get(`${API_END_POINT}commerce/${commerceId}/rating/recommendation`).then(responseHandler)

  }

  function commerces() {
    return $http.get(`${API_END_POINT}commerces`).then(responseHandler)
  }

  function saveCommerce(userId, data, files, quick = '') {
    data = angular.toJson(data) // is better that: JSON.stringify, because remove angular tracking values

    return Upload.upload({
      url: `${API_END_POINT}commerce/save?userId=${userId}`,
      data: {'data': data, files: files }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function quickSaveCommerce(data, files) {
    data = angular.toJson(data) // is better that: JSON.stringify, because remove angular tracking values

    return Upload.upload({
      url: `${API_END_POINT}commerce/quickSaveTotal`,
      data: {'data': data, files: files }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }
  
  function modifyCommerce(userId, commerceId, data, files) {
    data = angular.toJson(data)

    return Upload.upload({
      url: `${API_END_POINT}commerce/modify/${commerceId}?userId=${userId}`,
      data: {'data': data, files: files }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  // function quickModifyCommerce(userId, commerceId, data, files) {
  //   data = angular.toJson(data)

  //   return Upload.upload({
  //     url: `${API_END_POINT}commerce/quickModify/${commerceId}?userId=${userId}`,
  //     data: {'data': data, files: files }
  //   }).then(function(resp) {
  //     return responseHandler(resp)
  //   }, function(resp) {
  //     return responseHandler(resp)
  //   }, function(evt) {
  //   })
  // }

  function commentCommerce(userId, commerce) {
    const commerceId = commerce.id
    const parameters = {'comment': commerce.comment == null ? '' : commerce.comment}
    return $http.post(`${API_END_POINT}commerce/${commerceId}/saveQuestionForm?userId=${userId}`, parameters).then(responseHandler)
  }

  function findCommerce(commerceId) {
    return $http.get(`${API_END_POINT}commerce/find/${commerceId}`).then(responseHandler)
  }

  function findCommerceWithCategoriesDetails(commerceId) {
    return $http.get(`${API_END_POINT}commerce/find/details/${commerceId}`).then(responseHandler)
  }

  function findOwnerCommerce(commerceId, userId) {
    return $http.get(`${API_END_POINT}commerce/find/${commerceId}/owner?userId=${userId}`).then(responseHandler)
  }

  function getCommerceData(commerceId) {
    return $http.get(`${API_END_POINT}commerce/getCommerceData/${commerceId}`).then(responseHandler)
  }


  function searchCommerces(params) {

    const parameters = {
      'categoryId': miscellaneous.nullSafe(params.categoryId),
      'defaultIssue': miscellaneous.nullSafe(params.defaultIssue),
      'description': miscellaneous.nullSafe(params.description),
      'brandId': miscellaneous.nullSafe(params.brandId),
      'subbrandId': miscellaneous.nullSafe(params.subbrandId),
      'carYear': miscellaneous.nullSafe(params.carYear),
      'VIN': miscellaneous.nullSafe(params.VIN),
      'country': miscellaneous.nullSafe(params.country),
      'province': miscellaneous.nullSafe(params.province),
      'city': miscellaneous.nullSafe(params.city),
      'street': miscellaneous.nullSafe(params.street),
      'streetNumber': miscellaneous.nullSafe(params.streetNumber),
      'neighborhood': miscellaneous.nullSafe(params.neighborhood),
      'latitude': miscellaneous.nullSafe(params.latitude),
      'longitude': miscellaneous.nullSafe(params.longitude),
      'page': miscellaneous.nullSafe(params.page),
    }

    return $http.put(`${API_END_POINT}trader/search`, parameters).then(responseHandler)
  }

  function ratingCommerce(userId, commerceId) {
    const parameters = {
      'comment': miscellaneous.nullSafe(params.comment),
      'servicesRating': miscellaneous.nullSafe(params.servicesRating),
      'costsRating': miscellaneous.nullSafe(params.costsRating),
      'facilitiesRating': miscellaneous.nullSafe(params.facilitiesRating),
    }
    return $http.post(`${API_END_POINT}commerce/${commerceId}/rating/save?userId=${userId}`, parameters).then(responseHandler)
  }

  function getAllComments(commerceId, page) {
    return $http.get(`${API_END_POINT}commerce/${commerceId}/questions?page=${page}`).then(responseHandler)
  }

  function getCommerceMap(location) {
    return `${COMMERCE.BASE_MAP}${location.lat},${location.lng}&zoom=${COMMERCE.ZOOM}&size=${COMMERCE.WIDTH_MAP}x${COMMERCE.HEIGHT}&scale=2`
  }

  function saveQuestionFrom(commerceId, userId, comment) {
    return $http.post(`${API_END_POINT}commerce/${commerceId}/saveQuestionFrom?userId=${userId}`, { comment: comment }).then(responseHandler)
  }

  function existsInLocation(location) {
    return $http.post(`${API_END_POINT}commerce/exists/location`, { data: location }).then(responseHandler)
  }

  function claimCommerce(userId, commerceId) {
    return $http.post(`${API_END_POINT}commerce/claim?userId=${userId}&commerceId=${commerceId}`).then(responseHandler)
  }

  function hasClaimCommerce(commerceId, userId) {
    return $http.get(`${API_END_POINT}commerce/hasClaim?userId=${userId}&commerceId=${commerceId}`).then(responseHandler)
  }

  function productsAndCoupons(commerceId) {
    return $http.get(`${API_END_POINT}commerce/${commerceId}/products/coupons`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
