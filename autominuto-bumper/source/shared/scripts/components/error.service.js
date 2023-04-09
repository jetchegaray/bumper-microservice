'use strict'

angular.module('amApp').factory('errorService', errorService)

function errorService(modalMessageService, $state, localStorageService) {

  return {
    handle: handle
  }

  function handle(error) {
    console.log(JSON.stringify(error))
  
    if (error == null || error == undefined){
      clearCacheToRedirect()
      $state.go("error")

    } else if (error.status != undefined && (error.status == 500 || error.status == 400)){
      if (error.status == 500 || error.data.status == 500){
        clearCacheToRedirect()
        $state.go("error")
        return
      }
  
      if (error.data != undefined && error.data.message != undefined){
        clearCacheToRedirect()
        modalMessageService.error('Upsss !!', error.data.message, null)
        return 
      }else if (error.data != undefined && error.data.description != undefined){
        modalMessageService.error('Upsss !!',error.data.description, () => { $state.go('home') })
        return 
      }else {
        clearCacheToRedirect()
        $state.go("error")
        return 
      }
  
    } else if (error.status != undefined && (error.status == 404 || (error.data.message && error.data.message.includes("!DOCTYPE html"))) ){
        clearCacheToRedirect()
        $state.go("error")
        return
    } else if (error && error.data && error.data.httpStatus && error.data.description){
      clearCacheToRedirect()
      modalMessageService.error('Upsss !!', error.data.description, null)
      return 
    } else if (error.data == undefined && error.httpStatus && error.description){ //modals create cupons .. GET RID OF ME .. when it works properly
        clearCacheToRedirect()
        modalMessageService.error('Upsss !!', error.description)
        return 
    } else {
      clearCacheToRedirect()
      modalMessageService.error('Upsss !!', "Error interno en el servidor, disculpe las molestias", null)
      console.error('Undefined error')
    }
    
  }

  function clearCacheToRedirect(){
    localStorageService.remove('searchParams')
    localStorageService.remove('nextState') 
  }
}


/*
error: "Internal Server Error"
exception: "com.mongodb.DuplicateKeyException"
message: "Write failed with error code 11000 and error message 'E11000 duplicate key error index: heroku_sbjbqrjw.brandOfficialCommerces.$brandOfficialNameIndex dup key: { : { $ref: "brands", $id: ObjectId('5bbffe863c7ad82aa8ef838f') } }'"
path: "/trader/commerce/modify/5bc010343c7ad8391d8c5986"
status: 500
timestamp: 1540008518785

*/

/*
{ timestamp: 1539654637632,
status: 400,
error: 'Bad Request',
exception: 'org.springframework.http.converter.HttpMessageNotReadableException',
message: 'Could not read document: Can not deserialize instance of java.util.ArrayList out of START_OBJECT token\n at [Source: java.io.PushbackInputStream@36b54824; line: 1, column: 388] (through reference chain: ar.com.autominuto.trader.api.dto.search.SearchRequest["categories"]->java.util.ArrayList[0]->ar.com.autominuto.trader.api.dto.category.Category["childrens"]); nested exception is com.fasterxml.jackson.databind.JsonMappingException: Can not deserialize instance of java.util.ArrayList out of START_OBJECT token\n at [Source: java.io.PushbackInputStream@36b54824; line: 1, column: 388] (through reference chain: ar.com.autominuto.trader.api.dto.search.SearchRequest["categories"]->java.util.ArrayList[0]->ar.com.autominuto.trader.api.dto.category.Category["childrens"])',
path: '/trader/search' }

*/

/*
  this.code = code;
    this.httpStatus = httpStatus;
    this.description = description;
    this.moreInfoURL = "/error/"+code;
*/