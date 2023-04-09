'use strict'

angular.module('amApp').controller('ResultsController', resultsController)

function resultsController($stateParams, locationService, resultsService, searchService, NgMap, DEFAULT_IMAGES, ModalService, $state, MAP_WITHOUT_INTERESTS_POINTS_STYLE, 
  localStorageService, modalMessageService, serviceTypeService) {

  const $ctrl = this

  $ctrl.items = []
  $ctrl.brands = []
  $ctrl.services = []
  $ctrl.showSpinner = false
  $ctrl.emptyResults = false
  $ctrl.defaultLocation
  $ctrl.shownFirstTime = false // used to show the popup fot the first time when loading the page
  $ctrl.mapIdleEventCount = 0
  $ctrl.triggerZoomEvent = true

  $ctrl.search = {
    brand: {},
    service: {},
    location: null,
    onlyOfficialCommerces: false,
    onlyOfficialSpareParts: false,
    radius: null,
    filters: {
      promo: false,
      recommended: false,
      quality: false,
    },
    // subbrandInternalId: '0',
    // carYear: '0',
    // chasisNumber: '',
    // defaultIssue: '',
  }

  $ctrl.sortBy = null
  $ctrl.page = 1
  $ctrl.nextPage = true
  $ctrl.prevPage = false
  $ctrl.hoverMarkId

  $ctrl.addMouseOverClass = (id) => {
    $("[id="+id+"]:eq(1)").parent().addClass( "outstanding-custom-mark" );
  }
  $ctrl.addMouseOutClass = (id) => {
    $("[id="+id+"]:eq(1)").parent().removeClass( "outstanding-custom-mark" );
  }

  $ctrl.mouseover = function() {
    this.classList.add("outstanding-custom-mark");
  } 

  $ctrl.mouseout = function() { 
    this.classList.remove("outstanding-custom-mark");
  }

  $ctrl.$onInit = () => {
    $ctrl.showSpinner = true
    const brandsRequest = resultsService.getBrands().then(data => $ctrl.brands = data.content)
    const servicesRequest = serviceTypeService.getAll().then(data => $ctrl.services = data)
 
    //const params = $stateParams.params.split('_')

    if (!$stateParams.preserveLocationStored) {
      locationService.removeFormattedAddress()
    }

    let stateParams = {
        service : $stateParams.serviceSlug
    }

    stateParams.location = locationService.getFormattedAddress()

    if ($stateParams.brandSlug) { //Category and brand and location
      stateParams.brand = $stateParams.brandSlug
    } 
    if ($stateParams.locationSlug) { //Category and location
      stateParams.location = stateParams.location || $stateParams.locationSlug
    }

    const searchObject = searchService.getCurrentSearch() // Defined by searchModal or quoteBuilder
    const searchParamsURL = Object.keys(stateParams).length > 1 // Defined by URL

    Promise.all([brandsRequest, servicesRequest]).then(() => {

        const service = $ctrl.services.find(c => stateParams.service === c.slug)
        $ctrl.search.service = service
        
        if (!stateParams.brand && !stateParams.location) { //category only

          $ctrl.doStuffsOnlyService()

        } else if (stateParams.brand === undefined) { //category and location

            $ctrl.performSearch(stateParams, searchObject, searchParamsURL)

        } else { //category and brand and location

          const brand = $ctrl.brands.find(b => stateParams.brand === b.slug)
          $ctrl.search.brand = Object.assign(brand, { id: brand.value })
          
          resultsService.getBrandImage(brand.value)
            .then(data => {
              $ctrl.selectedBrand = { brandImage: data.brandImage, name: data.name, id: brand.value}
            })
            .catch(() => {
              $ctrl.selectedBrand = { brandImage: "assets/images/brands/pin.png", name: 'default' }
            })
            .finally(() => {
              $ctrl.performSearch(stateParams, searchObject, searchParamsURL)
            })
        }
    })
    .finally(
      //$ctrl.showSpinner = false
    )
  }


  $ctrl.handleSearchObject = searchObj => {
    searchService.clearCurrentSearch()

    $ctrl.search = searchObj
    $ctrl.search.brand.value = searchObj.brand.id
    $ctrl.centerMap(searchObj.location)

    if (!searchObj.location.streetAddress) {
      locationService.geocode(searchObj.location).then((res) => {
        const parsedAddress = locationService.parseGoogleAddress(res)
        $ctrl.search.location = parsedAddress
        $ctrl.defaultLocation = parsedAddress
        $ctrl.updateSearch()
      })
    } else {
      $ctrl.defaultLocation = searchObj.location
      $ctrl.updateSearch()
    }
  }

  $ctrl.handleSearchURI = params => {
    
    let paramsToBeParsed = { 
        location : params.location, 
        onlyOfficialCommerces : params.onlyOfficialCommerces, 
        onlyOfficialSpareParts : params.onlyOfficialSpareParts,
        brand : params.brand,
        service : params.service  
    }

    if (!params.location) {
      paramsToBeParsed.location = $ctrl.currentLocation.lat+'|'+$ctrl.currentLocation.lng
    }

    searchService.storeCurrentSearch(params)

    searchService.parseSearchURIParams(paramsToBeParsed).then(searchObj => {
      $ctrl.search = Object.assign(searchObj, { brand: $ctrl.search.brand, service: $ctrl.search.service })
      $ctrl.defaultLocation = searchObj.location
      $ctrl.centerMap(searchObj.location)
      $ctrl.updateSearch()
    }).catch((err) => {
      console.log('latLng is empty', err)
    })
  }

  $ctrl.handleSearchURIService = () => {
    let paramsToBeParsed = { location : $ctrl.currentLocation.lat+'|'+$ctrl.currentLocation.lng, onlyOfficialCommerces : 0, onlyOfficialSpareParts : 0}

    searchService.parseSearchURIParams(paramsToBeParsed).then(searchObj => {
      $ctrl.search = Object.assign(searchObj, { brand: null, service: $ctrl.search.service })
      $ctrl.defaultLocation = searchObj.location
      $ctrl.centerMap(searchObj.location)
      $ctrl.updateSearch()
    }).catch((err) => {
      console.log('latLng is empty', err)
    })
  }


  $ctrl.doStuffsOnlyService = () => {
    locationService.getBrowserLocation()
      .then(data => {
      
          $ctrl.currentLocation = { lat: data.coords.latitude, lng: data.coords.longitude }
          
          $ctrl.handleSearchURIService()              
      
          NgMap.getMap().then((map) => {
            map.mapTypes.set('styled_map', new google.maps.StyledMapType(MAP_WITHOUT_INTERESTS_POINTS_STYLE))
            map.setMapTypeId('styled_map')
            
            $ctrl.map = map
            $ctrl.centerMap($ctrl.search.location)
          })
      })
      .catch(error => { console.log("Couldn't get browser location " + error)})
      
      $.LoadingOverlay('hide', true)
      $ctrl.showSpinner = false
  }


  $ctrl.updateService = (serviceType) => {
    $ctrl.search.service = serviceType
  }

  $ctrl.updateBrand = brand => $ctrl.search.brand = brand

  $ctrl.updateLocation = location => $ctrl.search.location = location

  $ctrl.updatePromo = (promo) => {
    $ctrl.search.filters.promo = promo
    $ctrl.updateSearch()
  }

  $ctrl.updateRecommended = (recommended) => {
    $ctrl.search.filters.recommended = recommended
    $ctrl.updateSearch()
  }

  $ctrl.updateQuality = (quality) => {
    $ctrl.search.filters.quality = quality
    $ctrl.updateSearch()
  }

  $ctrl.updateOrderBy = (orderBy) => {
    $ctrl.orderBy = orderBy.id
    $ctrl.updateSearch()
  }

  $ctrl.updatePage = (page) => {
    if (page < $ctrl.page && !$ctrl.prevPage) return
    if (page > $ctrl.page && !$ctrl.nextPage) return
    $ctrl.page = page
    $ctrl.updateSearch()
  }

  $ctrl.onSearch = () => {
    const searchParams = Object.assign($ctrl.search, { address: $ctrl.search.location })
    searchService.setCurrentSearch(searchParams)
    $state.transitionTo($state.current, {'serviceSlug' : searchParams.service.slug, 'brandSlug' : searchParams.brand.slug, 'locationSlug' : searchParams.location.slug, 'preserveLocationStored' : true}, {reload:true, inherit:false})
  }

  $ctrl.updateSearch = () => {
    if (!$ctrl.search.service || !$ctrl.search.location) {
      $ctrl.showSpinner = false
      $ctrl.emptyResults = true
      return
    }
    $ctrl.items = []
    $ctrl.showSpinner = true
    window.scrollTo(0, 0)

    resultsService.search($ctrl.search, $ctrl.page, $ctrl.orderBy).then(res => {
      $ctrl.nextPage = res.content.nextPage
      $ctrl.prevPage = res.content.prevPage
      $ctrl.items = res.content.results.map(item => {
        item.type = 'result'
        item.items = false
        item.grade = item.grade.toLowerCase()
        return item
      })

      $ctrl.showSpinner = false
      $ctrl.emptyResults = $ctrl.items.length == 0

      let previousPage = localStorageService.get('previousPage')
      if (previousPage != undefined && previousPage && previousPage.includes('steps.final') ) {
        let link = "<a style=\'cursor:pointer\' href=\'/board/user/quotes\'><strong>aquí</strong></a>"
        modalMessageService.success('Listo ! Pedido enviado a los comercios cercanos', 'Desde tu perfil podés seguir el estado de todas tus solicitudes')  
        localStorageService.remove('previousPage') 
      }
//    $ctrl.showOfficialBrandingModal(res.content.officialBranding)
      fitMapToItems()
    }).catch(() => {
      $ctrl.showSpinner = false
    })
  }

  $ctrl.showOfficialBrandingModal = officialBranding => {
    officialBranding = officialBranding || []
    if(officialBranding.length === 0 || $ctrl.page > 1 || $ctrl.shownFirstTime) return

    $ctrl.shownFirstTime = true
    ModalService.showModal({
      templateUrl: 'search/views/popup.html',
      controller: 'ResultPopupController as $ctrl',
      inputs: {
        results: officialBranding,
        brand: $ctrl.selectedBrand,
        currentLocation: $ctrl.currentLocation
      },
      preClose: function(modal) {
        modal.element.modal('hide')
      }
    }).then(function(modal) {
      modal.element.modal()
      modal.close.then(function(commerceId) {
        if(commerceId) {
          $state.go('profile_commerce', {commerceId: commerceId })
        }
      })
    })
  }

  $ctrl.searchParamsAvaliable = () => Object.keys($stateParams).length > 1

  $ctrl.centerMap = (coords) => {
    if ($ctrl.map && coords && coords.lat && coords.lng) {
      $ctrl.map.setCenter(coords)
      $ctrl.marker = [coords.lat, coords.lng]      
    }
  }

  $ctrl.getDriverIcon = () => {
    return { url: 'assets/images/icons/marker-car2-red.png', scaledSize: [22, 30] }
  }

  $ctrl.getOfficialCommerceIcon = () => {
    return $ctrl.selectedBrand.brandImage
  }

  $ctrl.getUnOfficialCommerceIcon = (commerce) => {
    return commerce.logo ? commerce.logo : DEFAULT_IMAGES.COMMERCE
  }

  $ctrl.slickConfig = {
    centerMode: false,
    slidesToShow: 1,
    infinite: false,
    variableWidth: true,
    responsive: [
      { breakpoint: 1198, settings: {slidesToShow: 2, slidesToScroll: 2}},
      { breakpoint: 992,  settings: {slidesToShow: 3, slidesToScroll: 3}},
      { breakpoint: 666,  settings: {slidesToShow: 2, slidesToScroll: 2}},
      { breakpoint: 560,  settings: {slidesToShow: 1, slidesToScroll: 1}},
    ]
  }

  $ctrl.getSizeMap = () => {
    return window.innerHeight - 130
  }

  $ctrl.onZoomChanged = () => {
    if ($ctrl.triggerZoomEvent && $ctrl.mapIdleEventCount >= 3) {
      if ($ctrl.mapIdleEventCount === 3) {
        $ctrl.mapIdleEventCount = $ctrl.mapIdleEventCount + 1
      }
      $ctrl.search.radius = getVisibleRadius()
      loadMoreLocations()
    }
  }

  $ctrl.onTilesLoaded = () => {
    if ($ctrl.mapIdleEventCount < 3) {
      $ctrl.mapIdleEventCount = $ctrl.mapIdleEventCount + 1
    }
  }

  $ctrl.onDragEnd = () => {
    const newCenter = $ctrl.map.getCenter()
    $ctrl.search.location.lat = newCenter.lat()
    $ctrl.search.location.lng = newCenter.lng()
    loadMoreLocations().then(() => fitMapToItems())
  }

  $ctrl.performSearch = (stateParams, searchObject, searchParamsURL) => {
    if (stateParams.location == undefined) {
        locationService.getBrowserLocation().then( res => {
          $ctrl.currentLocation = { lat: res.coords.latitude, lng: res.coords.longitude }

          if (searchObject) {
            $ctrl.handleSearchObject(searchObject)
          } else if (searchParamsURL) {
            $ctrl.handleSearchURI(stateParams)
          }
        })
    } else {
      locationService.geocodeAddress(stateParams.location).then((res) => {
          const parsedAddress = locationService.parseGoogleAddress(res)
          $ctrl.search.location = $ctrl.currentLocation = parsedAddress
          delete $ctrl.search.radius //since it breaks the service when is null
          $ctrl.handleSearchObject($ctrl.search);
      })
    }

    NgMap.getMap().then((map) => {
      map.mapTypes.set('styled_map', new google.maps.StyledMapType(MAP_WITHOUT_INTERESTS_POINTS_STYLE))
      map.setMapTypeId('styled_map')

      $ctrl.map = map
      $ctrl.centerMap($ctrl.search.location)
    })

    $ctrl.showSpinner = false
    $.LoadingOverlay('hide', true)
  }

  const loadMoreLocations = () => {
    return new Promise((resolve, reject) =>  {
      $ctrl.showSpinner = true
      window.scrollTo(0, 0)

      resultsService.search($ctrl.search, $ctrl.page, $ctrl.orderBy).then(res => {
        $ctrl.nextPage = res.content.nextPage
        $ctrl.prevPage = res.content.prevPage
        $ctrl.items = res.content.results.map(item => {
          item.type = 'result'
          item.items = false
          item.grade = item.grade.toLowerCase()
          return item
        })

        $ctrl.showSpinner = false
        $ctrl.emptyResults = $ctrl.items.length == 0

        let previousPage = localStorageService.get('previousPage')
        if (previousPage != undefined && previousPage && previousPage.includes('steps.final') ) {
          modalMessageService.success('Los comercios más cercanos han recibido tu pedido', 'Puedes seguir el avance de tus pedidos de presupuestos en tu perfil de usuario !')  
          localStorageService.remove('previousPage') 
        }
  //      $ctrl.showOfficialBrandingModal(res.content.officialBranding)
      resolve()
      }).catch(() => {
        $ctrl.showSpinner = false
        reject()
      })
    })
  }

  const getVisibleRadius = () => {
    if ($ctrl.map) {
      const bounds = $ctrl.map.getBounds()
      const center = $ctrl.map.getCenter()
      const ne = bounds.getNorthEast()
      return google.maps.geometry.spherical.computeDistanceBetween(center, ne) / 1000
    }
  }

  const fitMapToItems = () => {
    $ctrl.triggerZoomEvent = false
    const bounds = new google.maps.LatLngBounds()
    $ctrl.items.forEach(item => {
      const loc = new google.maps.LatLng(item.position[0], item.position[1])
      bounds.extend(loc)
    })
    
    //Include search location
    bounds.extend(new google.maps.LatLng($ctrl.search.location.lat, $ctrl.search.location.lng))
    
    $ctrl.map.fitBounds(bounds)
    $ctrl.triggerZoomEvent = true
  }
}
