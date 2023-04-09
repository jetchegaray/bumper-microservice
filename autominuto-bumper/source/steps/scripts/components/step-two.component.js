'use strict'

angular.module('amApp').component('stepTwo', {
  templateUrl: 'steps/views/step-two.html',
  controller: StepTwoController,
  bindings: {}
})

function StepTwoController(_, localStorageService, homeService, errorService, QuoteBuilder, spinner, stepsHandler, STEP, userService, $scope, $state, $window, $timeout, anchorSmoothScroll) {

  const $ctrl = this

  $ctrl.brands = []
  $ctrl.userCars = []
  $ctrl.cars = []
  $ctrl.insuranceCompanies = []

  $ctrl.$onInit = () => {

    $window.fbq('track', 'StepTwoVisited')

    spinner.start()

    $ctrl.cars = stepsHandler.getStepData(STEP.TWO)

    // Get brands and user cars
    const userId = localStorageService.get('userId')
    const brandsRequest = homeService.classifiedBrands()
      .then(res =>
        $ctrl.brands =
          _.filter(res.serviceBrands, b => {
            b.label = b.name
            _.each(b.subbrands, sb => sb.label = sb.name)
            b.subbrands = _.sortBy(b.subbrands, sb => sb.label = sb.name)
            return b
          })
      )
      .catch(err => errorService.handle(err))

    const insurancesCompaniesRequest = userService.getAllInsurancesCompanies()
      .then(response => $ctrl.insuranceCompanies = _.sortBy(response, 'name'))
      .catch(err => errorService.handle(err))

    if (userId){
      const userCarsRequest = userService.getCars(userId).then(res => $ctrl.userCars = res).catch(err => errorService.handle(err))
      Promise.all([brandsRequest, insurancesCompaniesRequest, userCarsRequest]).then(() => {
        spinner.stop()
        $scope.$apply()
        anchorSmoothScroll.scrollTo('questionTwo', 70)
 
      })
    }else {
      Promise.all([brandsRequest, insurancesCompaniesRequest]).then(() => {
        spinner.stop()
        $scope.$apply()
        anchorSmoothScroll.scrollTo('questionTwo', 70)
 
      })
    }


    // Hide spinner when all requests are resolved

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
  }

  $ctrl.saveCarSubBrand = (car, subBranSelected) => {
    car.subBrand = _.find(car.brand.subbrands, sb => sb.id == subBranSelected || sb.name == subBranSelected)
    $('#year').focus()
  }

  $ctrl.saveCarInsurance = (car, insuranceSelected) => {  
    car.insurance = _.find($ctrl.insuranceCompanies, i => i.id == insuranceSelected || i.name == insuranceSelected)
    $('#address').focus()
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

  $ctrl.continue = () => {
    $ctrl.stepTwoForm.$submitted = true

    if ($ctrl.stepTwoForm.$valid) {
      QuoteBuilder.addCarData($ctrl.cars)
      stepsHandler.setStepData(STEP.TWO, $ctrl.cars)
      $state.go('steps.three')
    }
  }

  $ctrl.back = () => {
    $state.go('steps.one')
  }

  $ctrl.isProductCategory = () => {
    let selectedOptionFirstStep = stepsHandler.getStepData(STEP.ONE)
    return !selectedOptionFirstStep.service
  }

  $ctrl.showChasis = () => {
    let selectedOptionFirstStep = stepsHandler.getStepData(STEP.ONE)
    return selectedOptionFirstStep.chasisNeeded
  }
}
