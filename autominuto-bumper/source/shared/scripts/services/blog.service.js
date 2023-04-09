'use strict'

angular.module('amApp').factory('blogService', blogService)

function blogService($http, BLOG_ENDPOINT) {

  return {
    lastPost: lastPost,
    lastPostConciendoTuAuto: lastPostConciendoTuAuto
  }

  function lastPost(limit) {
    return $http.get(`${BLOG_ENDPOINT}/posts?page=1&per_page=${limit}&orderby=date&order=desc&_embed`).then(responseHandler)
  }

  function lastPostConciendoTuAuto(limit) {
    return $http.get(`${BLOG_ENDPOINT}/posts?page=1&per_page=${limit}&orderby=date&order=desc&categories=49&_embed`).then(responseHandler)
  }

  function  responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
