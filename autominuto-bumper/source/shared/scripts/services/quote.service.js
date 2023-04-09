'use strict'

angular.module('amApp').factory('quoteService', quoteService)

function quoteService($http, API_END_POINT, miscellaneous, localStorageService, Upload) {

  return {
    saveQuotes: saveQuotes,
    saveAppointment: saveAppointment,
    saveReply: saveReply,
    saveReplies: saveReplies,
    rejectQuote: rejectQuote,
    getAllByCommerce: getAllByCommerce,
    getAllByUser: getAllByUser,
    saveStatus: saveStatus,
    findQuoteForRating: findQuoteForRating,
    saveRating: saveRating,
    hasRating: hasRating,
    getAllRatings: getAllRatings
  }

  function saveQuotes(quote, files) {
    const userId = localStorageService.get('userId')
    return Upload.upload({
      url: `${API_END_POINT}quote/save?userId=${userId}`,
      data: { 'quote': angular.toJson(quote), files: files}
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

   function saveAppointment(data, commerceId, files) {
    return Upload.upload({
      url: `${API_END_POINT}quote/save/appointment?commerceId=${commerceId}`,
      data: { 'quoteData': angular.toJson(data), files: files}
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
 //   return $http.post(`${API_END_POINT}quote/save/appointment?userId=${userId}&commerceId=${commerceId}`, {quoteData: quote}).then(responseHandler)
  }

  function findQuoteForRating(idQuote) {
    return $http.get(`${API_END_POINT}quote/${idQuote}/rating`).then(responseHandler)
  }

  function saveReply(replyData, commerceId, idQuote, productsData, files) {
     let data = {
        reply : replyData,
        product : productsData
    }
    return $http.post(`${API_END_POINT}quote/${idQuote}/reply?commerceId=${commerceId}`, { 'data': angular.toJson(data), files}).then(responseHandler)
  }

  function saveReplies(replies, commerceId, idQuote, productsData, fileImage, saveThemAtStore) {
    var data = {
        replies : replies,
        services : productsData.services,
        serviceType : productsData.serviceType,
        saveThemAtStore : saveThemAtStore
    }
    return Upload.upload({
      url: `${API_END_POINT}quote/${idQuote}/replies?commerceId=${commerceId}`,
      data: { 'data': angular.toJson(data), files: fileImage}
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
    //return $http.post(`${API_END_POINT}quote/${idQuote}/replies?commerceId=${commerceId}`, { 'data': angular.toJson(data), files: fileImage}).then(responseHandler)
  }

  function rejectQuote(data, commerceId, idQuote) {
    return $http.post(`${API_END_POINT}quote/${idQuote}/refuse?commerceId=${commerceId}`, { replyData: data }).then(responseHandler)
  }

  function getAllByCommerce(commerceId, status, lastLogin, page) {
    return $http.get(`${API_END_POINT}quote/commerce/${commerceId}/${status}?page=${page}&lastLogin=${lastLogin}`).then(responseHandler)
  }

  function getAllByUser(status, lastLogin, page) {
    const userId = localStorageService.get('userId')
    return $http.get(`${API_END_POINT}quote/user/${userId}/${status}?page=${page}&lastLogin=${lastLogin}`).then(responseHandler)
  }

  function saveStatus(quoteId, replyId, commerceId, requestStatus) {
    if(commerceId){
      return $http.post(`${API_END_POINT}quote/${quoteId}/status/${replyId}?commerceId=${commerceId}`, {requestStatus: requestStatus}).then(responseHandler)
    } else {
      return $http.post(`${API_END_POINT}quote/${quoteId}/status/${replyId}`, {requestStatus: requestStatus}).then(responseHandler)
    }
  }

  function saveRating(quoteId, commerceId, rating) {
    const userId = localStorageService.get('userId')
    return $http.post(`${API_END_POINT}quote/${quoteId}/rating/save?userId=${userId}&commerceId=${commerceId}`, {rating: rating}).then(responseHandler)
  }

  function hasRating(quoteId, commerceId) {
    const userId = localStorageService.get('userId')
    return $http.get(`${API_END_POINT}quote/${quoteId}/has/rating?userId=${userId}&commerceId=${commerceId}`).then(responseHandler)
  }

  function getAllRatings(commerceId, page) {
    const userId = localStorageService.get('userId')
    return $http.get(`${API_END_POINT}quote/ratings/commerce/${commerceId}?page=${page}`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
