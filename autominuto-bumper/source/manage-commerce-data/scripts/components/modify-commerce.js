'use strict'

angular.module('amApp').component('addValidateCommerce', {
  templateUrl: 'manage-commerce-data/views/add-validate-commerce.html',
  controller: AddValidateCommerce,
  bindings: {
    // value ​​used to change styles and show or hide components
    completePage: '<',
    imageLogoName: '='
  }
})

function AddValidateCommerce($scope, NgMap, $timeout, ModalService, commerceService, homeService, $stateParams, $state, locationService,
                             localStorageService, userService, _, IMAGES_COMMERCE, DEFAULT_LOCATION, errorService, MAP_WITHOUT_INTERESTS_POINTS_STYLE,
                             modalMessageService, commerceTypeService) {
  var $ctrl = this
  $ctrl.title = ($stateParams.commerceId) ? 'VALIDACIÓN DE COMERCIO' : 'REGISTRO DE COMERCIO'
  $ctrl.submitButtonTitle = ($stateParams.commerceId) ? 'VERIFICAR COMERCIO' : 'REGISTRAR COMERCIO'

  // commerce data obtained fromserver
  $ctrl.dataCommerce = null
  $ctrl.commerceTypes = []
  $ctrl.selectedCommerceTypes = []

  $ctrl.insuranceCompanies = []
  $ctrl.selectedInsuranceCompanies = []

  $ctrl.serviceBrands = []
  $ctrl.addedServiceBrands = []
  $ctrl.serviceBrandsChecked = []

  $ctrl.autoPartsBrand = []
  $ctrl.selectedAutoPartsBrand = []
  $ctrl.autoPartsBrandChecked = []
  $ctrl.multimarca = false

  $ctrl.phones = []
  $ctrl.phones.push(buildEmptyPhone())

  $ctrl.commerce = fillCommerce(null)

  /* LOGICA DIAS Y HORARIOS DE ATENCIÓN */
  $ctrl.workingHours = [
    {
      dias: {lu: false, ma: false, mi: false, ju: false, vi: false, sa: false, do: false, fe: false},
      horario: [{open: new Date(1970, 0, 1, 0, 0, 0), close: new Date(1970, 0, 1, 0, 0, 0)}]
    }
  ]

  $ctrl.allDayOpenCheck = false

  $ctrl.newSparePartsBrands = [{name: ''}]

  $ctrl.diasSeleccionados = {
    lu: {value: false, pos: null},
    ma: {value: false, pos: null},
    mi: {value: false, pos: null},
    ju: {value: false, pos: null},
    vi: {value: false, pos: null},
    sa: {value: false, pos: null},
    do: {value: false, pos: null},
    fe: {value: false, pos: null}
  }

  $ctrl.address
  $ctrl.marker
  $ctrl.flags = {
    'loadingLocation': false,
    'locationError': false,
    'addressDirty': false,
  }
  $ctrl.defaultCoords = DEFAULT_LOCATION

  // store a set of image files in this order: logo, facade, interior, streetView, employees, workstation
  // save image files
  $ctrl.commerceImages = [null, null, null, null, null, null]

  $ctrl.commerceLabels = ['logo', 'front', 'inside', 'streetView', 'employers', 'workStation']

  $ctrl.pathImages = [IMAGES_COMMERCE.COMMERCE_LOGO, IMAGES_COMMERCE.COMMERCE_FACADE, IMAGES_COMMERCE.COMMERCE_INTERIOR,
    IMAGES_COMMERCE.COMMERCE_EXTERIOR, IMAGES_COMMERCE.COMMERCE_EMPLOYEES, IMAGES_COMMERCE.WORKSTATION]


  $ctrl.defaultCommerceLogoPath = IMAGES_COMMERCE.COMMERCE_LOGO

  $ctrl.$onInit = function () {
    NgMap.getMap().then((map) => {
      map.mapTypes.set('styled_map', new google.maps.StyledMapType(MAP_WITHOUT_INTERESTS_POINTS_STYLE))
      map.setMapTypeId('styled_map')
      $ctrl.map = map
      $ctrl.rawAddress = ''
      $ctrl.setAddress($ctrl.defaultCoords)
    })

    const commerceTypeRequest = commerceTypeService.getAll().then(data => {
        $ctrl.commerceTypes = data
    }).catch(err => {
      $.LoadingOverlay('hide', true)
      errorService.handle(err)
    }).then(() => {
    })

    const insuranceCompaniesRequest = userService.getAllInsurancesCompanies().then(data => {
        $ctrl.insuranceCompanies = data
    }).catch(err => {
      $.LoadingOverlay('hide', true)
      errorService.handle(err)
    }).then(() => {
    })


    const brandsRequest = homeService.classifiedBrands().then(data => {
      $ctrl.serviceBrands = data.serviceBrands
      $ctrl.autoPartsBrand = data.autoPartsBrand
    }).catch(err => {
      $.LoadingOverlay('hide', true)
      errorService.handle(err)
    }).then(() => {
    })

    const commerceRequest = commerceService.getCommerceData($stateParams.commerceId).then(data => {
      $ctrl.dataCommerce = data
      $ctrl.commerce = fillCommerce(data)
    }).catch(err => {
      errorService.handle(err)
    })

    const requests = [brandsRequest, commerceTypeRequest, insuranceCompaniesRequest, commerceRequest]
    
    $.LoadingOverlay('show')
    Promise.all(requests).then(() => {
      if (commerceRequest !== null) {
        $ctrl.fillPhones($ctrl.dataCommerce.phones)
        $ctrl.fillTypes($ctrl.dataCommerce.types)
        $ctrl.fillWorkingHours($ctrl.dataCommerce)
       //just specializedBrands $ctrl.fillServiceBrands($ctrl.dataCommerce.serviceBrands)
        $ctrl.fillServiceBrands($ctrl.dataCommerce.specializedBrands)
        $ctrl.fillServiceOfficialBrands($ctrl.dataCommerce.serviceOfficialBrands)
        $ctrl.fillAutoPartBrands($ctrl.dataCommerce.sparePartsBrands)
        $ctrl.fillAutoPartOfficialBrands($ctrl.dataCommerce.sparePartsOfficialBrands || [])
        $ctrl.fillLocation($ctrl.dataCommerce.location)
        $ctrl.fillPhotosCommerce($ctrl.dataCommerce.imageData)
        $ctrl.fillInsuranceCompanies($ctrl.dataCommerce.insuranceCompanies)
        $ctrl.multimarca = $ctrl.dataCommerce.specializedBrands.length == 0
        //$scope.$apply()
      }
      $.LoadingOverlay('hide')
  
    })
  }

  /**
   * Start Section address
   */
  $ctrl.placeChanged = function () {
    $ctrl.flags.addressDirty = true
    $ctrl.setAddress(locationService.parseGoogleAddress(this.getPlace()))
  }

  $ctrl.setAddress = (address) => {
    $ctrl.address = address
    if (address) {
      $ctrl.centerMap(address)
    }
  }

  $ctrl.centerMap = (coords) => {
    $ctrl.map.setCenter(coords)
    $ctrl.marker = [coords.lat, coords.lng]
  }

  $ctrl.getLocation = () => {
    $ctrl.flags.loadingLocation = true
    locationService.getBrowserLocation().then((res) => {
      const coords = {
        lat: res.coords.latitude,
        lng: res.coords.longitude,
      }
      return locationService.geocode(coords)
    })
      .then(googleAddress => {
        const parsedAddress = locationService.parseGoogleAddress(googleAddress)
        $ctrl.setAddress(parsedAddress)
        $ctrl.rawAddress = locationService.getAddressLine(parsedAddress)
      })
      .catch(err => {
        $ctrl.flags.locationError = true
        $timeout(function () {
          $ctrl.locationError = false
        }, 3 * 1000)
      })
      .then(() => {
        $ctrl.flags.loadingLocation = false
        $ctrl.flags.addressDirty = true
        $scope.$apply()
      })
  }


  $ctrl.fillPhotosCommerce = (imageData) => {
    imageData.forEach(function (image) {
      for (let index = 0; index < $ctrl.commerceLabels.length; index++) {
        if (image.type === $ctrl.commerceLabels[index]) {
          $ctrl.pathImages[index] = image.path
          break
        }
      }
    })

  }

  $ctrl.fillTypes = (types) => {
    $ctrl.selectedCommerceTypes = types
  }

  $ctrl.fillInsuranceCompanies = (companies) => {
      $ctrl.selectedInsuranceCompanies = companies
  }

  $ctrl.fillWorkingHours = (data) => {
    if (data.workingHours.periods != null && data.workingHours.periods.length) {
      $ctrl.workingHours = []

      _.forEach(data.workingHours.periods, function (workingHour) {
        _.forEach(workingHour.horario, function (horario) {
          let openHour = horario.openHourTime
          openHour = openHour.split(":")
          horario.open = new Date(1970, 0, 1, openHour[0], openHour[1], 0, 0)
          let closeHour = horario.closeHourTime
          closeHour = closeHour.split(":")
          horario.close = new Date(1970, 0, 1, closeHour[0], closeHour[1], 0, 0)

        })
      })

      $ctrl.workingHours = data.workingHours.periods
      $ctrl.allDayOpenCheck = data.workingHours.open24
      $ctrl.diasSeleccionados = data.selectedDays
    }
  }

  $ctrl.fillLocation = location => {
    let coords = $ctrl.defaultCoords

    if (typeof location !== 'undefined') {
      coords = {lat: parseFloat(location.lat), lng: parseFloat(location.lng)}
    }

    locationService.geocodeAllDirections(coords)
      .then(googleAddresses => {
        const parsedAddress = locationService.parseGoogleAddresses(googleAddresses)

        $ctrl.setAddress(parsedAddress)
        $ctrl.rawAddress = locationService.getAddressLine(parsedAddress)
      })
      .catch(err => {
        $ctrl.flags.locationError = true
        $timeout(function () {
          $ctrl.locationError = false
        }, 3 * 1000)
      })
      .then(() => {
        $ctrl.flags.loadingLocation = false
        $ctrl.flags.addressDirty = true
        $scope.$apply()
      })
  }

  $ctrl.fillServiceBrands = (commerceBrands) => {
    _.forEach(commerceBrands, function (brand) {
      for (let index = 0; index < $ctrl.serviceBrands.length; index++) {
        if (brand.id === $ctrl.serviceBrands[index].id) {
          $ctrl.serviceBrandsChecked[index] = true
          $ctrl.addServiceBrand(index)
          break
        }
      }
    })
  }

  $ctrl.fillServiceOfficialBrands = serviceOfficialBrands => {

    _.forEach(serviceOfficialBrands, function (serviceOfficialBrand) {
      for (let index = 0; index < $ctrl.addedServiceBrands.length; index++) {
        if (serviceOfficialBrand.id == $ctrl.addedServiceBrands[index].id) {
          $ctrl.addedServiceBrands[index].official = true
          break
        }
      }
    })
  }

  $ctrl.fillAutoPartBrands = sparePartsBrands => {
    _.forEach(sparePartsBrands, function (sparePartBrand) {
      for (let index = 0; index < $ctrl.autoPartsBrand.length; index++) {
        if (sparePartBrand.id === $ctrl.autoPartsBrand[index].id) {
          $ctrl.autoPartsBrandChecked[index] = true
          $ctrl.addAutoPartBrand(index)
          break
        }
      }
    })
  }

  $ctrl.fillAutoPartOfficialBrands = sparePartsOfficialBrands => {

    _.forEach(sparePartsOfficialBrands, function (sparePartBrand) {
      for (let index = 0; index < $ctrl.selectedAutoPartsBrand.length; index++) {
        if (sparePartBrand.id == $ctrl.selectedAutoPartsBrand[index].id) {
          $ctrl.selectedAutoPartsBrand[index].official = true
          break
        }
      }
    })
  }


  $ctrl.fillPhones = phones => {
    $ctrl.phones = phones
  }

  function fillCommerce(dataCommerce) {
    return {
      name: (dataCommerce) ? dataCommerce.name : '',
      images: dataCommerce ? dataCommerce.images : [],
      description: (dataCommerce) ? dataCommerce.description : '',
      email: (dataCommerce) ? dataCommerce.email : '',
      alternativeEmail: (dataCommerce) ? dataCommerce.alternativeEmail : '',
      cuit: (dataCommerce) ? dataCommerce.cuit : '',
      phones: [],
      nextelId: (dataCommerce) ? dataCommerce.nextelId : '',
      hasWifi: (dataCommerce) ? dataCommerce.hasWifi : false,
      hasAir: (dataCommerce) ? dataCommerce.hasAir : false,
      hasWaitingArea: (dataCommerce) ? dataCommerce.hasWaitingArea : false,
      hasPostSales: (dataCommerce) ? dataCommerce.hasPostSales : false,
      hasGaranty: (dataCommerce) ? dataCommerce.hasGaranty : false,
      hasComputerDiagnostics: (dataCommerce) ? dataCommerce.hasComputerDiagnostics : false,
      hasTemporalCar: (dataCommerce) ? dataCommerce.hasTemporalCar : false,
      hasSavingPlan: (dataCommerce) ? dataCommerce.hasSavingPlan : false,
      validated: true, // always
      location: null,
      serviceBrands: [],
      serviceOfficialBrands: [],
      sparePartsBrands: [],
      sparePartsOfficialBrands: [],
      types: [],
      facebook: (dataCommerce) ? dataCommerce.facebook : '',
      twitter: (dataCommerce) ? dataCommerce.twitter : '',
      youtube: (dataCommerce) ? dataCommerce.youtube : '',
      commerceWeb: (dataCommerce) ? dataCommerce.commerceWeb : '',
      workingHours: {periods: []},
      distributor: false, // always
      manufacture: false,  // always
      paymentMethods: (dataCommerce) ? dataCommerce.paymentMethods : {},
    }
  }

  function buildEmptyPhone() {
    return {
      areaCode: '',
      number: '',
      cellPhone: false,
      countryCodeNumber: '+54',
      acceptWhatsapp: false,
      acceptMessages: false
    }
  }

//   function formatPhones(phones) {
//     let formatedPhones = [];
//     _.forEach(phones, function (phone) {
//       formatedPhones.push(
//         phoneService.savePhone(phone)
//       )
//     })
//     return formatedPhones;
//   }

  $ctrl.buildCommerceData = () => {
    $ctrl.commerce.id = $stateParams.commerceId
    $ctrl.commerce.phones = _.filter($ctrl.phones, function (phone) {
        if (phone.areaCode && phone.number) {
            return phone
        }
    });
    $ctrl.commerce.location = $ctrl.address
    $ctrl.commerce.workingHours.periods = $ctrl.generatePeriodsWorkingHours()
    $ctrl.commerce.workingHours.open24 = $ctrl.allDayOpenCheck

    $ctrl.commerce.types = _.map($ctrl.selectedCommerceTypes, function (type) {
      return {id: type.id}
    })

    if (!$ctrl.multimarca) {
      let serviceOfficialBrands = _.filter($ctrl.addedServiceBrands, function (brand) {
        return brand.official === true
      })
      $ctrl.commerce.serviceOfficialBrands = _.map(serviceOfficialBrands, function (officialBrand) {
        return {id: officialBrand.id}
      })
    } else {
      $ctrl.commerce.serviceOfficialBrands = []
    }

    $ctrl.commerce.specializedBrands = []
    $ctrl.commerce.specializedBrands = _.map($ctrl.addedServiceBrands, function (serviceBrand) {
      return {id: serviceBrand.id}
    })

    let sparePartsOfficialBrands = _.filter($ctrl.selectedAutoPartsBrand, function (autoPartBrand) {
      return autoPartBrand.official === true
    })
    $ctrl.commerce.sparePartsOfficialBrands = _.map(sparePartsOfficialBrands, function (sparePartBrand) {
      return {id: sparePartBrand.id}
    })

    $ctrl.commerce.sparePartsBrands = []
    $ctrl.commerce.sparePartsBrands = _.map($ctrl.selectedAutoPartsBrand, function (sparePartBrand) {
      return {id: sparePartBrand.id}
    })

    let sparePartsBuilded = buildNewSparePartsBrands()
    $ctrl.commerce.newSparePartsBrands = sparePartsBuilded

    $ctrl.commerce.insuranceCompanies = _.map($ctrl.selectedInsuranceCompanies, function (company) {
      return {id: company.id}
    })

  }

  function buildNewSparePartsBrands(){
    let sparePartsBuilded = []
    for(let x = 0; x < $ctrl.newSparePartsBrands.length; x++){
      if($ctrl.newSparePartsBrands[x].name != ''){
        sparePartsBuilded.push($ctrl.newSparePartsBrands[x])
      }
    }

    // EC6 Para no duplicar elementos, devuelve únicos con el mismo nombre
    return sparePartsBuilded
  }

  $ctrl.addNewSparePartsBrands = () => {
    $ctrl.newSparePartsBrands.push(
      {
        name: ''
      }
    )
  }

  $ctrl.deleteNewSparePartsBrands = (index) => {
    $ctrl.newSparePartsBrands.splice(index, 1)
  }

  $ctrl.generatePeriodsWorkingHours = () => {
    let myWorkingHours = []

    _.forEach($ctrl.workingHours, function (workingHour) {
      for (let day in workingHour.dias) {
        if (workingHour.dias[day] === true) {
          let openDay = (day === 'lu') ? 1 : (day === 'ma') ? 2 : (day === 'mi') ? 3 : (day === 'ju') ? 4 : (day === 'vi') ? 5 :
            (day === 'sa') ? 6 : (day === 'do') ? 7 : 8

          _.forEach(workingHour.horario, function (horario) {
            let workingTime = {
              openDay: openDay,
              openHour: moment(horario.open).format('HH:mm'),
              closeHour: moment(horario.close).format('HH:mm'),
              openHourTime: moment(horario.open).format('HH:mm'),
              closeHourTime: moment(horario.close).format('HH:mm'),
            }
            myWorkingHours.push(workingTime)
          })
        }
      }
    })

    return myWorkingHours
  }


  $ctrl.saveCommerce = function () {
    $ctrl.buildCommerceData();

    if ($ctrl.isFormValid()) {

      // user commerce
      const userId = localStorageService.get('userId')
      let typeImages = $ctrl.getTypeImages()

      $.LoadingOverlay('show');
      if ($ctrl.dataCommerce !== null) {
        $ctrl.commerce.images = $ctrl.replaceImages()

        if (userService.authenticated()) {
          commerceService.modifyCommerce(userId, $stateParams.commerceId,
            {
              commerce: $ctrl.commerce,
              typeImages: typeImages
            }, $ctrl.commerceImages)
            .then((data) => {
              if ($stateParams.goToPlans == true){ //I alse use it for redirect
                $state.go('plans', {commerceId: $stateParams.commerceId})
              }else {
                window.scrollTo(0, 0)
                //update logo at banner / image to the logo at banner
                $ctrl.imageLogoName = (data.logo) ? data.logo + "?width=105&height=105" : ""
                modalMessageService.success('Listo ! ', 'Tus cambios fueron salvados correctamente.')
              }
            })
            .catch(err => {
              errorService.handle(err)
            })
            .then(() => {
              $.LoadingOverlay('hide')
            })
        } else {
          Promise.all($ctrl.commerceImages.map(getBase64)).then(encodedImages => {
            const commerceToSave = {
              commerceId: $stateParams.commerceId,
              commerce: $ctrl.commerce,
              typeImages: typeImages,
              images: encodedImages
            }
            localStorageService.set('commerceToSave', commerceToSave)
            localStorageService.remove('quote_data')
            $state.go('login')
            $.LoadingOverlay('hide')
          }).catch(error => {
              errorService.handle(err)
          })
        }
      } 
    }
  }


  $ctrl.replaceImages = () => {
    let originalPathImages = [IMAGES_COMMERCE.COMMERCE_LOGO, IMAGES_COMMERCE.COMMERCE_FACADE, IMAGES_COMMERCE.COMMERCE_INTERIOR,
      IMAGES_COMMERCE.COMMERCE_EXTERIOR, IMAGES_COMMERCE.COMMERCE_EMPLOYEES, IMAGES_COMMERCE.WORKSTATION]

    let images = angular.copy($ctrl.commerce.images)

    $ctrl.commerceImages.forEach((imageFile, index) => {
      if (imageFile !== null) {
        if ($ctrl.pathImages[index] !== originalPathImages[index]) {
          let pathImage = $ctrl.pathImages[index]

          for (let index = 0; index < images.length; index++) {
            let nameImage = images[index].name
            if (pathImage.includes(nameImage)) {
              images.splice(index, 1)
              break
            }
          }
        }
      }
    })

    return images
  }

  $ctrl.isFormValid = () => {
    const isValid =
        $ctrl.commerceForm.$valid &&
        // $ctrl.existsSelectedCategory() &&
        $ctrl.hastAtLeastOneBrandSelected() &&
        $ctrl.validWorkingHours() &&
        $ctrl.hasLogo()

    return isValid
  }

  $ctrl.existsSelectedDay = () => {
    for (let key in $ctrl.diasSeleccionados) {
      let day = $ctrl.diasSeleccionados[key]
      if (day.value) {
        return true
      }
    }
    return false
  }

  $ctrl.validWorkingHours = () => {
    if ($ctrl.workingHours.length === 0) return false
    if (!$ctrl.existsSelectedDay()) return false

    return true
  }

  $ctrl.hasLogo = () => {
    return $ctrl.commerceImages[0] || ($ctrl.pathImages[0] !== IMAGES_COMMERCE.COMMERCE_LOGO)
  }

  $ctrl.hastAtLeastOneBrandSelected = () => {
    return $ctrl.multimarca || $ctrl.addedServiceBrands.length > 0 || $ctrl.selectedAutoPartsBrand.length > 0
  }

  $ctrl.change = (propName, value, pos) => {
    if (value == true) {
      $ctrl.diasSeleccionados[propName].pos = pos;
      $ctrl.diasSeleccionados[propName].value = value;
    } else {

      $ctrl.diasSeleccionados[propName].pos = null;
      $ctrl.diasSeleccionados[propName].value = false;
    }
  }

  $ctrl.deleteWorkingDay = index => {
    for (var propName in $ctrl.diasSeleccionados) {

      if ($ctrl.diasSeleccionados[propName].pos == index) {
        $ctrl.diasSeleccionados[propName].pos = null;
        $ctrl.diasSeleccionados[propName].value = false;
      }
      if ($ctrl.diasSeleccionados[propName].pos > index) {
        $ctrl.diasSeleccionados[propName].pos -= 1;
      }
    }
    $ctrl.workingHours.splice(index, 1);
  }

  $ctrl.deleteWorkingHourDay = (indexWorkingDay, indexHourDay) => {
    $ctrl.workingHours[indexWorkingDay].horario.splice(indexHourDay, 1)
  }

  $ctrl.addHour = index => {
    $ctrl.workingHours[index].horario.push(
      {
        open: new Date(1970, 0, 1, 0, 0, 0),
        close: new Date(1970, 0, 1, 0, 0, 0)
      }
    );
  }

  $ctrl.addWorkingDay = function () {
    $ctrl.workingHours.push(
      {
        dias: {
          lu: false,
          ma: false,
          mi: false,
          ju: false,
          vi: false,
          sa: false,
          do: false,
          fe: false
        },
        horario: [
          {
            open: new Date(1970, 0, 1, 0, 0, 0),
            close: new Date(1970, 0, 1, 0, 0, 0)
          }
        ]
      }
    )
  }

  $ctrl.selectAllServiceBrands = () => {
    angular.forEach($ctrl.serviceBrands, function (brand, index) {
      $ctrl.serviceBrandsChecked[index] = $ctrl.checkAllServiceBrands;
    })

    if ($ctrl.checkAllServiceBrands) {
      $ctrl.addedServiceBrands = $ctrl.serviceBrands.slice();
    } else {
      $ctrl.addedServiceBrands = [];
    }
  }

  $ctrl.addServiceBrand = indexBrandSelected => {
    $ctrl.serviceBrands[indexBrandSelected].official = false

    if ($ctrl.addedServiceBrands.indexOf($ctrl.serviceBrands[indexBrandSelected]) == -1) {
      $ctrl.addedServiceBrands.push($ctrl.serviceBrands[indexBrandSelected])
    } else {
      $ctrl.addedServiceBrands.splice($ctrl.addedServiceBrands.indexOf($ctrl.serviceBrands[indexBrandSelected]), 1)
      $ctrl.checkAllServiceBrands = false
    }
  }


  $ctrl.addAutoPartBrand = (index) => {
    $ctrl.autoPartsBrand[index].official = false

    if ($ctrl.selectedAutoPartsBrand.indexOf($ctrl.autoPartsBrand[index]) == -1) {
      $ctrl.selectedAutoPartsBrand.push($ctrl.autoPartsBrand[index])
    } else {
      $ctrl.selectedAutoPartsBrand.splice($ctrl.selectedAutoPartsBrand.indexOf($ctrl.autoPartsBrand[index]), 1);
      $ctrl.checkAllAutoPartsBrand = false
    }
  }

  $ctrl.selectAllAutoPartsBrand = () => {
    angular.forEach($ctrl.autoPartsBrand, function (brand, index) {
      $ctrl.autoPartsBrandChecked[index] = $ctrl.checkAllAutoPartsBrand
    });

    if ($ctrl.checkAllAutoPartsBrand) {
      $ctrl.selectedAutoPartsBrand = $ctrl.autoPartsBrand.slice()
    } else {
      $ctrl.selectedAutoPartsBrand = []
    }
  }

  $ctrl.addPhone = () => {
    $ctrl.phones.push(buildEmptyPhone())
  }

  $ctrl.deletePhone = (index) => {
    $ctrl.phones.splice(index, 1)
  }

  $ctrl.getTypeImages = () => {
    let results = []

    $ctrl.commerceImages.map((value, index) => {
      if (value !== null) {
        results.push($ctrl.commerceLabels[index])
      }
    })
    return results
  }

  $ctrl.toggleTooltip = function() {
    $('.tooltip-multi-marca').addClass('tooltip-gen-auto');

    $timeout(
      function () {
        $('.tooltip-multi-marca').removeClass('tooltip-gen-auto');
      }, 5000 //it has to match with seconds "animation: cssAnimation 5s forwards" in /source/shared/styles/tooltip/tooltip-gen.scss
    );

  }


  const getBase64 = file =>
    new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      } else {
        resolve(null)
      }
    })

}
