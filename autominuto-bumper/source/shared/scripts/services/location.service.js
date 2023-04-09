'use strict'

angular.module('amApp').factory('locationService', locationService)

function locationService(_, $window, DEFAULT_LOCATION, modalMessageService, localStorageService, handlerAutocompleteCategories) {

  return {
    getDefaultLocation: getDefaultLocation,
    getBrowserLocation: getBrowserLocation,
    parseGoogleAddress: parseGoogleAddress,
    parseGoogleAddresses: parseGoogleAddresses,
    getAddressLine: getAddressLine,
    getAddressLineWithoutStreet : getAddressLineWithoutStreet,
    appendAddressLine: appendAddressLine,
    geocode: geocode,
    geocodeAddress: geocodeAddress,
    geocodeAllDirections: geocodeAllDirections,
    measureDistance: measureDistance,
    storeFormattedAddress: storeFormattedAddress,
    getFormattedAddress: getFormattedAddress,
    removeFormattedAddress: removeFormattedAddress,
  }

  function getDefaultLocation() {
    return DEFAULT_LOCATION
  }

  function getBrowserLocation() {
    console.log("location browser");
    return new Promise((resolve, reject) => {

      if (!$window.navigator) {
        let errorMessage = 'Navigator not supported'
        modalMessageService.error(errorMessage, 'Por favor actualice su navegador')
        reject(Error(errorMessage));
      }

      $window.navigator.geolocation.getCurrentPosition(
        function(status) {
            resolve(status);
        },
        function(error) {
          if (error.code === 1) {
            modalMessageService.error('Atención', 'Activá tu geolocalización para utilizar esta funcionalidad')
          }
          reject(Error(error.message));
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    })
  }

  function parseGoogleAddress(googleAddress, allowInvalid) {
    
    const parsedAddress = {}
    let contains
    let type
    const fields = ['street_number',
      'route',
      'locality',
      'neighborhood',
      'sublocality_level_1',
      'administrative_area_level_1',
      'postal_code',
      'administrative_area_level_2',
      'country',
      'subpremise'
    ]

    // Build new address shared object with keys in 'fields' array
    angular.forEach(googleAddress.address_components, (value, key) => {
      contains = false
      type = ''
      angular.forEach(value.types, (val, k) => {
        if (contains == false && fields.indexOf(val) != -1) {
          type = val
          contains = true
        }
      })

      if (contains) {
        parsedAddress[type] = value.long_name
        if(type === 'administrative_area_level_1') {
          parsedAddress['short_name_area_level_1'] = value.short_name
        } 
      }
    })

    // For highways we assign subpremise to street_number
    if (!parsedAddress.street_number) {
        parsedAddress.street_number = parsedAddress.subpremise || ''
    }

    if (!parsedAddress.route) {
        parsedAddress.route = googleAddress.vicinity || ''
    }

    // An address is consirered 'invalid' if it does not possess street_number and route
    if (!allowInvalid && (parsedAddress.street_number == undefined || parsedAddress.route === undefined)) {
      return undefined
    }

    let city = parsedAddress.administrative_area_level_1
    let province = (city && parsedAddress.short_name_area_level_1 !== "CABA") ? parsedAddress.locality : city
    
    province = (!province || province == undefined || parsedAddress.locality == parsedAddress.administrative_area_level_2) ? parsedAddress.administrative_area_level_1 :  province
    const otherCity = parsedAddress.administrative_area_level_2

    city = (city && parsedAddress.short_name_area_level_1 === "CABA") ? "Capital Federal" : otherCity
    
    const location = {
      lat: googleAddress.geometry.location.lat(),
      lng: googleAddress.geometry.location.lng(),
      streetAddress: {
        street: parsedAddress.route,
        streetNumber: parsedAddress.street_number,
        neighborhood: parsedAddress.neighborhood || parsedAddress.sublocality_level_1 || parsedAddress.locality,
      },
      place: {
        province: province, // parsedAddress.administrative_area_level_1,
        city: city,
        zipCode: parsedAddress.postal_code,
        countryCode: parsedAddress.country
      }
    }
    
    let location_search = location.streetAddress.neighborhood || location.place.city+"-"+location.place.province
    location.slug = handlerAutocompleteCategories.accentFold(location_search.toLowerCase().replace(/ /g, '-'))

    this.storeFormattedAddress(googleAddress.formatted_address)

    return location
  }

  function parseGoogleAddresses(googleAddresses, allowInvalid) {
    
    for (var i = 0; i <= googleAddresses.length - 1; i++) {

      let nextItem =  false
      let contains
      let type
      const parsedAddress = {}
      const fields = ['street_number',
        'route',
        'locality',
        'neighborhood',
        'sublocality_level_1',
        'administrative_area_level_1',
        'postal_code',
        'administrative_area_level_2',
        'country'
      ]

      // Build new address shared object with keys in 'fields' array
      angular.forEach(googleAddresses[i].address_components, (value, key) => {
        contains = false
        type = ''
        angular.forEach(value.types, (val, k) => {
          if (contains == false && fields.indexOf(val) != -1) {
            type = val
            contains = true
          }
        })

        if (contains) {
          parsedAddress[type] = value.long_name
          if(type === 'administrative_area_level_1') {
            parsedAddress['short_name_area_level_1'] = value.short_name
          } 
        }
      })
      
      // An address is consirered 'invalid' if it does not possess street_number and route
      if (!allowInvalid && (!parsedAddress.street_number || !parsedAddress.route)) {
        nextItem = true //continue loop
      }

      if (!nextItem){
        let city = parsedAddress.administrative_area_level_1
        let province = (city && parsedAddress.short_name_area_level_1 !== "CABA") ? parsedAddress.locality : city
        province = (!province || province == undefined || parsedAddress.locality == parsedAddress.administrative_area_level_2) ? parsedAddress.administrative_area_level_1 :  province
        const otherCity = parsedAddress.administrative_area_level_2

        city = (city && parsedAddress.short_name_area_level_1 === "CABA") ? "Capital Federal" : otherCity
 
        const location = {
          lat: googleAddresses[i].geometry.location.lat(),
          lng: googleAddresses[i].geometry.location.lng(),
          streetAddress: {
            street: parsedAddress.route,
            streetNumber: parsedAddress.street_number,
            neighborhood: parsedAddress.neighborhood || parsedAddress.sublocality_level_1 || parsedAddress.locality,
          },
          place: {
            province: province,
            city: city,
            zipCode: parsedAddress.postal_code,
            countryCode: parsedAddress.country
          }
        }

        let location_search = location.streetAddress.neighborhood || location.place.city+"-"+location.place.province
        location.slug = handlerAutocompleteCategories.accentFold(location_search.toLowerCase().replace(/ /g, '-'))


        this.storeFormattedAddress(parsedAddress.formatted_address)

        return location
      }
    }
  }

  function getAddressLine(address) {
    const addressLine = []
    if (address.streetAddress) {
      if (address.streetAddress.street) addressLine.push(address.streetAddress.street)
      if (address.streetAddress.streetNumber) addressLine.push(address.streetAddress.streetNumber)
      if (address.streetAddress.neighborhood) addressLine.push(address.streetAddress.neighborhood)    
    }
    if (address.place) {
      if (address.place.province) addressLine.push(address.place.province)
   //   if (address.place.countryCode) addressLine.push(address.place.countryCode)
    }
    return addressLine.join(', ')
  }


  function getAddressLineWithoutStreet(address) {
    const addressLine = []
    if (address.streetAddress) {
      if (address.streetAddress.neighborhood) addressLine.push(address.streetAddress.neighborhood)
    }
    if (address.place) {
      if (address.place.province) addressLine.push(address.place.province)
   //   if (address.place.countryCode) addressLine.push(address.place.countryCode)
    }
    return addressLine.join(', ')
  }

  function appendAddressLine(addresses) {
    return _.map(addresses, (address) => {
      address.addressLine = getAddressLine(address)
      return address
    })
  }

  // Get code by coords
  function geocode(coords) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder
      geocoder.geocode({'location': coords}, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            resolve(results[0])
          } else {
            reject('No results found')
          }
        } else {
          reject(Error(status))
        }
      })
    })
  }

  // Get code by address
  function geocodeAddress(address, country = 'Argentina') {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder
      geocoder.geocode({'address': address + ' ' + country}, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            resolve(results[0])
          } else {
            reject('No results found')
          }
        } else {
          reject(Error(status))
        }
      })
    })
  }  

  function geocodeAllDirections(coords) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder
      geocoder.geocode({'location': coords}, (results, status) => {
        if (status === 'OK') {
          if (results) {
            resolve(results)
          } else {
            reject('No results found')
          }
        } else {
          reject(Error(status))
        }
      })
    })
  }

  function measureDistance(from, to, parsed = false) {
    if (Number.prototype.toRadians === undefined) {
      Number.prototype.toRadians = function() { return this * Math.PI / 180 }
    }
    const R = 6371e3
    const φ1 = from.lat.toRadians()
    const φ2 = to.lat.toRadians()
    const Δφ = (to.lat-from.lat).toRadians()
    const Δλ = (to.lng-from.lng).toRadians()
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c
    return parsed ? parseDistance(d) : d
  }

  function parseDistance(meters) {
    let distance = ''
    if (meters < 1000) {
      distance = Math.round(meters) + ' m'
    } else {
      distance = Math.round(meters / 1000) + ' km'
    }
    return distance
  }

  function storeFormattedAddress(formattedAddress) {
    localStorageService.set('formattedAddress', formattedAddress)
  }

  function getFormattedAddress() {
    return localStorageService.get('formattedAddress')
  }

  function removeFormattedAddress() {
    localStorageService.remove('formattedAddress')
  }
}
