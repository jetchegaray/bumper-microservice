'use strict'

angular.module('amApp').factory('searchService', searchService)

function searchService(locationService, localStorageService, handlerAutocompleteCategories) {  //handlerAutocompleteCategories only to reuse accent function

  var currentSearch = null

  return {
    getCurrentSearch: getCurrentSearch,
    setCurrentSearch: setCurrentSearch,
    storeCurrentSearch: storeCurrentSearch,
    setCurrentQuote: setCurrentQuote,
    clearCurrentSearch: clearCurrentSearch,
    parseSearchURIParams: parseSearchURIParams,
  }

  function getCurrentSearch() {
    return currentSearch
  }

  function setCurrentSearch(basicSearch) {
    // This method builds and stores current search object
    // Also, returns corresponding URI params to redirect to /busqueda
    let location = null

    if(basicSearch.address) { //if (basicSearch.useLocation) {
      location = basicSearch.address
    } else {
      location = locationService.getDefaultLocation()

      let location_search = currentSearch.location.streetAddress.neighborhood || currentSearch.location.place.city+"-"+currentSearch.location.place.province
      location.slug += handlerAutocompleteCategories.accentFold(location_search.toLowerCase().replace(/ /g, '-')) 
    }

    let brand = null
    if (basicSearch.brand){
      brand = {
        id: basicSearch.brand.value,
        label: basicSearch.brand.label,
        slug: basicSearch.brand.slug
      }
    }

    currentSearch = {
      brand: brand,
      service: basicSearch.service,
      location: location,
      onlyOfficialCommerces: basicSearch.onlyOfficialCommerces,
      onlyOfficialSpareParts: basicSearch.onlyOfficialSpareParts,
      filters: {
        promo: false,
        recommended: false,
        quality: false,
      },
    }

    storeCurrentSearch(currentSearch)
    return currentSearch
  }

  function storeCurrentSearch(currentSearch) {
    localStorageService.set('searchParams', currentSearch)
  }

  function setCurrentQuote(quoteData, items) {

    //FIXME categories should be called services. and it should be an array
    
    currentSearch = {
      service: quoteData.category,
      brand: {
        id: quoteData.brandId,
        label: quoteData.brandName,
        slug: quoteData.search.brand
      },
      location: quoteData.location,
      onlyOfficialCommerces: false,
      onlyOfficialSpareParts: false,
      filters: {
        promo: false,
        recommended: false,
        quality: false,
      }
      //quoteCommerces: items
      // quoteCommerces se usaba antes para guardar los comercios que se mostraban en el popup,
      // el servicio savequote devuelve dicho valor, ya no es necesario
    }

    return currentSearch
  }

  function clearCurrentSearch() {
    currentSearch = null
  }

  /*function buildSearchURIParams(currentSearch) {

    let params = currentSearch.service.slug

    if (currentSearch.brand && currentSearch.brand.slug) {
        params += '/' + currentSearch.brand.slug
    }

    if (currentSearch.location) {
        let location_search = currentSearch.location.streetAddress.neighborhood || currentSearch.location.place.city
        params += '/' + handlerAutocompleteCategories.accentFold(location_search.toLowerCase().replace(/ /g, '-')) 
    }

    //storeCurrentSearch(params)

    return params
  }*/

  function parseSearchURIParams(params) {
    let coords = {}
    if (!params.location) {
      coords = locationService.getDefaultLocation()
    } else if (typeof params.location === 'object') {
      coords = params.location
    } else {
      const latLng = params.location.split('|')
      coords = {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])}
    }

    return locationService.geocode(coords).then(address => {
      const search = {}
      search.onlyOfficialCommerces = params.onlyOfficialCommerces == 1
      search.onlyOfficialSpareParts = params.onlyOfficialSpareParts == 1
      search.location = locationService.parseGoogleAddress(address)
      search.filters = {
        promo: false,
        recommended: false,
        quality: false,
      }
      return search
    })
  }

}
