'use strict'

angular.module('amApp').factory('categoryService', categoryService)

function categoryService($http, API_END_POINT) {

  return {
    topAddCommerceCategories: topAddCommerceCategories
  }

  function topAddCommerceCategories(commentId, answer) {
    return $http.get(API_END_POINT + "category/topCategories/addCommerce").then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
