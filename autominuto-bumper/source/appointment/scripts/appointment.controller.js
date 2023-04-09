'use strict'

angular.module('amApp').controller('AppointmentController', AppointmentController)

function AppointmentController(_, localStorageService, $state, $stateParams, userService, commerceService, homeService, quoteService,
  errorService, $scope, locationService, EXTRA_FIELDS, TIPO_PRODUCTO, $timeout, $window) {
  const $ctrl = this

  $ctrl.dataUser = userService.getUserData()
  $ctrl.searchParams = localStorageService.get('searchParams')
  $ctrl.brand = {}
  $ctrl.brands = []
  $ctrl.userCars = []
  $ctrl.cars = []
  $ctrl.minDatetime = moment()
  $ctrl.datetimes = []
  $ctrl.selectedServiceType
  $ctrl.explanations
  $ctrl.address
  $ctrl.allServices = []
  $ctrl.insuranceCompanies = []
  $ctrl.isProductIncludedChecked = false
  $ctrl.commerceData

   //Text description
  const desclimit = 100
  $ctrl.descriptionExpanded = false
  $ctrl.descLimit = desclimit

  $ctrl.$onInit = () => {
    $.LoadingOverlay("show");

    if ($ctrl.searchParams && $ctrl.searchParams.brand) {
        $ctrl.brandSelected = $ctrl.searchParams.brand.label
    }

    $ctrl.datetimes.push({})
    $ctrl.cars.push({})
    // it's has been saved search-modal.controller.js

    const brandsRequest = homeService.classifiedBrands()
      .then(res => $ctrl.brands = _.each(res.serviceBrands, b => {
      _.each(b.subbrands, sb => sb.label = sb.name)
      b.label = b.name
    }))
    .catch(err => errorService.handle(err))

    const requestCategories = commerceService.findCommerceWithCategoriesDetails($stateParams.commerceId)
      .then(data => {
        $ctrl.commerceData = data
        $ctrl.allServices = data.services
        $ctrl.selectedServiceType = _.find($ctrl.allServices, service => service.slug == $stateParams.serviceSlug)
      })
      .catch(err  => {
        errorService.handle(err)
    })

    const insuranceCompaniesRequest = userService.getAllInsurancesCompanies().then(data => {
        $ctrl.insuranceCompanies = _.sortBy(data, 'name')
    }).catch(err => {
      $.LoadingOverlay('hide', true)
      errorService.handle(err)
    }).then(() => {
    })

    const userId = $ctrl.dataUser.id
    if (userId != undefined){
      const userCarsRequest = userService.getCars(userId).then(res => {$ctrl.userCars = res
      })
      .catch(data => errorService.handle(data))

      Promise.all([requestCategories ,brandsRequest, userCarsRequest, insuranceCompaniesRequest]).then(() => {
        $.LoadingOverlay("hide", true);
      })
    }else {
      Promise.all([requestCategories ,brandsRequest]).then(() => {
        $.LoadingOverlay("hide", true);
      })
    }

    // Hide spinner when all requests are resolved
    $ctrl.getLocation()
  }

  $ctrl.loadMoreCategoryService = () =>{
    $ctrl.limitCategoryServices += 15
  }

  $ctrl.addCar = () => {
    $ctrl.cars.push({})
  }

  $ctrl.removeCar = (car) => {
    const index = $ctrl.cars.indexOf(car)
    if (index != 0) {
      $ctrl.cars.splice(index, 1)
    }
  }

  $ctrl.saveCarBrand = (car, brandSelected) => {
    car.brand = _.find($ctrl.brands, b => b.id == brandSelected || b.name == brandSelected)
    delete car.subBrand
    $('#subbrand input').val('')

    $timeout( function () {
      $('#subbrand input').focus()
    }, 0)
  }

  $ctrl.saveCarInsurance = (car, insuranceSelected) => {
    car.insurance = _.find($ctrl.insuranceCompanies, i => i.id == insuranceSelected || i.name == insuranceSelected)
  }

  $ctrl.getMainImage = () => {
    let mainImage = ""
    if($ctrl.commerceData.images && $ctrl.commerceData.images.length) {
      let result = $ctrl.commerceData.images.find(function(image) {
        return image.logo === true
      })
      if (result && result.path && result.path.length > 0)
        mainImage = result.path + '?width=180&height=180'
    }
    return mainImage
  }

  $ctrl.saveCarSubBrand = (car, subBranSelected) => {
    car.subBrand = _.find(car.brand.subbrands, sb => sb.id == subBranSelected || sb.name == subBranSelected)
    $('#year').focus()
  }

  $ctrl.selectUserCar = (car, selectedUserCar) => {
    if (!selectedUserCar || !selectedUserCar.brand.subbrands) {
      return
    }
    const brand = _.find($ctrl.brands, b => b.name == selectedUserCar.brand.name)
    let subBrand = _.find(brand.subbrands, sb => sb.internalId == selectedUserCar.brand.subbrands[0].internalId)
    car.brand = brand
    car.subBrand = subBrand
    car.year = selectedUserCar.year
    car.vin = selectedUserCar.chasisNumber
    car.kms = selectedUserCar.kilometers
    if (selectedUserCar.insurance != undefined && selectedUserCar.insurance){
      car.insurance = _.find($ctrl.insuranceCompanies, b => b.name == selectedUserCar.insurance.name)
    }
  }

  $ctrl.isProductCategory = () => {
    return $ctrl.selectedServiceType != undefined && !$ctrl.selectedServiceType.service
  }

  $ctrl.showChasis = () => {
    return $ctrl.selectedServiceType != undefined && $ctrl.selectedServiceType.chasisNeeded
  }

  $ctrl.addDatetime = () => {
    if ($ctrl.datetimes.length < 3){
      $ctrl.datetimes.push({})
    }
  }

  $ctrl.removeDatetime = (datetime) => {
    var index = $ctrl.datetimes.indexOf(datetime)
    if (index != 0) {
      $ctrl.datetimes.splice(index, 1)
    }
  }

  $ctrl.parseDatetimes = () => {
    let datetimes = []
    _.each($ctrl.datetimes, datetime => datetimes.push({date: datetime.date, time: datetime.time}))
    return datetimes
  }

  $ctrl.getAppointments = () => {
    let appointments = []
    _.each($ctrl.datetimes, datetime => {
      if (datetime && datetime.date && datetime.time)
        appointments.push({'date': datetime.date + ' ' + datetime.time, 'chooseIt' : false})})
    return appointments
  }

  $ctrl.timeSelectable = (time) => {
    return 7 <= time.hour() && time.hour() <= 20
  }

  $ctrl.changeLimit = () => {
    $ctrl.descLimit = $ctrl.selectedServiceType.description.length
    $ctrl.descriptionExpanded = true
  }

/*  $ctrl.validDatetimes = () => {
    return _.every($ctrl.datetimes, datetime => datetime.date && datetime.time)
  }
*/
  $ctrl.getLocation = () => {
    locationService.getBrowserLocation().then((res) => {
      const coords = {
        lat: res.coords.latitude,
        lng: res.coords.longitude,
      }
      return locationService.geocode(coords)
    })
    .then(googleAddress => {
      const parsedAddress = locationService.parseGoogleAddress(googleAddress)
      $ctrl.address = parsedAddress
  //    $ctrl.rawAddress = locationService.getAddressLine(parsedAddress)
    })
    .catch(err => {
      errorService.handle(err)
    })
    .then(() => {
    })
  }


 $ctrl.isLogged = function () {
    return userService.authenticated()
  }

  $ctrl.onKeydown = (event) => {
    var s = String.fromCharCode(event.which);
    if (s.toUpperCase() === s && s.toLowerCase() !== s && !event.shiftKey ) {
      $('.tootiop-caps-lock').addClass('tooltip-gen-auto');
      $timeout(
        function () {
            $('.tootiop-caps-lock').removeClass('tooltip-gen-auto');
        }, 5000 //it has to match with seconds "animation: cssAnimation 5s forwards" in /source/shared/styles/tooltip/tooltip-gen.scss
      );
    }
  }

  $ctrl.toggleShowPassword = function() {
    $ctrl.showPassword = !$ctrl.showPassword;
  }

  $ctrl.askAppointment = () => {

    if(!$ctrl.appointmentForm.$valid || !$ctrl.selectedServiceType) {
      return
    }

    let car = $ctrl.cars[0]
    const userId = localStorageService.get('userId')
    let request = {}

    if (!userService.authenticated()) {
      request.user = {
        email: $ctrl.email,
        password: $ctrl.password,
        nickName: userService.buildNickName($ctrl.email)
      }
    } else {
      request.user = {
        id: userId
      }
    }

    let quote = {}

    quote.quoteType = ($ctrl.selectedServiceType.quoteable) ? "QUOTE_REQUEST" : "TURN_REQUEST"
    quote.brandId =  (car.brand) ? car.brand.id : null
    quote.subbrandInternalId = (car.subBrand != undefined) ? car.subBrand.internalId : null
    quote.carYear = car.year
    quote.chasisNumber = car.vin
    quoteData.carKms = car.kms
    quoteData.carInsuranceId = (car.insurance) ? car.insurance.id : null

    quote.carEngine = ""
    quote.location = $ctrl.address

    /********************************************/
    //($ctrl.searchParams && $ctrl.searchParams.location) ? $ctrl.searchParams.location :
    quote.explanations = $ctrl.explanations
    quote.possibleAppointments = $ctrl.getAppointments()
    quote.serviceTypeIds = [$ctrl.selectedServiceType.id]
    quote.serviceTypeDetail = ''
    let imagesList = []

    if ($ctrl.isProductIncludedChecked) {
      quote.serviceTypeDetail = "Incluye Repuesto " + ': Si, '
    }

    _.forEach($ctrl.selectedServiceType.components, (component) => {

      switch (component.componentType) {

        case EXTRA_FIELDS.INPUT_TEXT :
          _.forEach(component.options, o => {
            if (o.value) {
              let name = o.name.split("*")[0].split("(Opcional")[0]
              quote.serviceTypeDetail += name + ': ' + o.value + ','
            }
          })
          break;
        case EXTRA_FIELDS.DROP_DOWN :
          _.forEach(component.options, o => {
            if (o.selected) {
              if (o.name.toLowerCase().trim() == TIPO_PRODUCTO.ALTERNATIVO_NACIONAL.toLowerCase()
               || o.name.toLowerCase().trim() == TIPO_PRODUCTO.ALTERNATIVO_IMPORTADO.toLowerCase()
               || o.name.toLowerCase().trim() == TIPO_PRODUCTO.OFICIAL.toLowerCase()
               || o.name.toLowerCase().trim() == TIPO_PRODUCTO.NO_SE.toLowerCase()) {
                quote.serviceTypeDetail += 'Tipo de producto' + ': ' + o.name + ','
              } else {
                quote.serviceTypeDetail += o.name + ': ' + 'Si' + ','
              }
            }
          })
          break;
        case EXTRA_FIELDS.CHECK_BOX :
          _.forEach(component.options, o => {
            if (o.selected) {
              quote.serviceTypeDetail += o.name + ': ' + 'Si' + ','
            }
          })
          break;
        case EXTRA_FIELDS.RADIO_BUTTON :
          if (component.selected) {
            quote.serviceTypeDetail += component.title
              ? (component.title + ': ' + component.selected + ',')
              : (component.selected + ': ' + 'Si' + ',')
          }
          break;
        case EXTRA_FIELDS.INPUT_IMAGES :
           _.map(component.images, function (image) {
             imagesList.push(base64ToFile(image))
          })
          break;
      }
    })

    request.quote = quote
    saveAppointment(request, $stateParams.commerceId, imagesList)
  }


  const saveAppointment = (request, commerceId, files) => {
    $.LoadingOverlay("show");
    quoteService.saveAppointment(request, commerceId, files).then(res => {
      $window.fbq('track', 'CompleteOneQuoteToCommerce')

      if (!userService.authenticated()) {
        userService.saveUserData(res)
      }

      $state.go("board.user.quotes")
    }).catch(data => {
       errorService.handle(data)
    })
    .then(() =>  $.LoadingOverlay("hide"))
  }


  const base64ToFile = base64 => {
      if (base64) {
        const arr = base64.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        //second parameter is the name of the image. If i use the same name always. the id in nodejs at saving time will be the same. so bug equals images
        function chr4(){
          return Math.random().toString(16).slice(-4);
        }
        //728bb9221e13f952192bc243fcd4c388
        return new File([u8arr], chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4(), {type: mime});
      } else {
        return null
      }
    }
}
