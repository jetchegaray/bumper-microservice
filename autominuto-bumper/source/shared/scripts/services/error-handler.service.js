'use strict'

angular.module('amApp').factory('errorHandler', errorHandler)

function errorHandler() {

  return {
    parse: parse,
    responseHandler: responseHandler,
  }

  function parse(error) {

    if (typeof error === 'string') {
      return error
    }

    let message = 'Error del servidor'

    if (error) {
      if (!error.status || error.status != 500) {
        if (error.data) {
          message = error.data.message || error.data.description
        } else {
          message = error.statusText
        }
      } else {
        message = error.message || error.error
      }
    } else{
      console.error('Undefined error')
    }

    return message
  }


  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
