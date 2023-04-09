'use strict'

angular.module('amApp').factory('commentsService', commentsService)

function commentsService($http, API_END_POINT) {

  return {
    saveAnswerCommerce: saveAnswerCommerce
  }

  function saveAnswerCommerce(commentId, answer) {
    return $http.post(API_END_POINT + "comment/" + commentId + "/saveAnswerCommerce", {answer: answer}).then(responseHandler)
  }

  function saveAnswerProduct(productId, answer) {
    return $http.post(API_END_POINT + "product/" + productId + "/saveAnswerCommerce", {answer: answer}).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
