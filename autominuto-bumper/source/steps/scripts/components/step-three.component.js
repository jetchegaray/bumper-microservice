'use strict'

angular.module('amApp').component('stepThree', {
  templateUrl: 'steps/views/step-three.html',
  controller: StepThreeController,
  bindings: {}
})

function StepThreeController(stepsHandler, QuoteBuilder, NgMap, locationService, userService, localStorageService, $scope, $state, $timeout, $window, STEP, MAP_WITHOUT_INTERESTS_POINTS_STYLE, _, anchorSmoothScroll) {

  const $ctrl = this

  $ctrl.address
  $ctrl.userAddresses = []
  $ctrl.minDatetime = moment()
  $ctrl.datetimes = []
  $ctrl.marker
  $ctrl.types = "['address']"
  $ctrl.flags = {
    'loadingLocation': false,
    'locationError': false,
    'addressDirty': false,
  }
  $ctrl.isDateOpened = [false, false, false]
  $ctrl.isTimeOpened = [false, false, false]

  $ctrl.$onInit = () => {

    $window.fbq('track', 'StepThreeVisited')

    const userId = localStorageService.get('userId')
    const stepData = stepsHandler.getStepData(STEP.THREE)

    if (userId) {
      userService.getAddresses(userId).then(addresses => $ctrl.userAddresses = locationService.appendAddressLine(addresses))
    }

    $ctrl.datetimes = stepData.datetimes

    NgMap.getMap().then((map) => {
      map.mapTypes.set('styled_map', new google.maps.StyledMapType(MAP_WITHOUT_INTERESTS_POINTS_STYLE))
      map.setMapTypeId('styled_map')
      $ctrl.map = map
      $ctrl.setAddress(stepData.address)
      $ctrl.rawAddress = stepData.rawAddress

      anchorSmoothScroll.scrollTo('paso3', 70)
    })

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

  $ctrl.selectUserAddress = (userAddress) => {
    $ctrl.setAddress(userAddress)
    $ctrl.rawAddress = userAddress.addressLine
  }

  $ctrl.placeChanged = function() {
    $ctrl.flags.addressDirty = true
    $ctrl.setAddress(locationService.parseGoogleAddress(this.getPlace()))
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
      $timeout(function() { $ctrl.locationError = false }, 3 * 1000)
    })
    .then(() => {
      $ctrl.flags.loadingLocation = false
      $ctrl.flags.addressDirty = true
      $scope.$apply()
    })
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
    _.each($ctrl.datetimes, datetime => {
      if (datetime != undefined && datetime.time != undefined)
        datetimes.push({date: datetime.date, time: datetime.time})    
    })
    return datetimes
  }

  $ctrl.getAppointments = () => {
    let appointments = []

    _.each($ctrl.datetimes, datetime => {
      if (datetime != undefined && datetime.time != undefined)
        appointments.push({'date': datetime.date + ' ' + datetime.time, 'chooseIt' : false})
    })
    return appointments
  }

  $ctrl.timeSelectable = (time) => {
    return 7 <= time.hour() && time.hour() <= 20
  }

  /*$ctrl.validDatetimes = () => {
    return _.every($ctrl.datetimes, datetime => datetime.date && datetime.time)
  }*/

  $ctrl.continue = () => {

    $ctrl.formstep3.$submitted = true

    if($ctrl.isFormValid()){

      QuoteBuilder.addLocation($ctrl.address)
      QuoteBuilder.addAppointments($ctrl.getAppointments())
      stepsHandler.setStepData(STEP.THREE, {address: $ctrl.address, rawAddress: $ctrl.rawAddress, datetimes: $ctrl.parseDatetimes()})

      $state.go('steps.final')
      //$state.transitionTo('steps.final', {}, {reload:true, inherit:false})
    }
    
  }

  $ctrl.isFormValid = () => {

    let isValid = $ctrl.address && $ctrl.rawAddress 
    if ($ctrl.isNotProductCategory()){
      isValid = isValid /*&& $ctrl.validDatetimes()*/
    }
    return isValid
  }

  $ctrl.isNotProductCategory = () => {
    return stepsHandler.getStepData(STEP.ONE).service
  }

  $ctrl.back = () => {
     $state.go('steps.two')
  }

  $ctrl.switchDateOpened = (index) => {
    $ctrl.isDateOpened[index] = !$ctrl.isDateOpened[index]
  }
  
  $ctrl.switchTimeOpened = (index) => {
    $ctrl.isTimeOpened[index] = !$ctrl.isTimeOpened[index]
  }
}
