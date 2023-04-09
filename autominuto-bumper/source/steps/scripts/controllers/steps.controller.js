'use strict'

angular.module('amApp').controller('StepsController', StepsController)

function StepsController(stepsHandler, QuoteBuilder, $state, STEP, $stateParams) {

  const $ctrl = this

  $ctrl.$onInit = () => {
    $ctrl.handleRedirect()
    $ctrl.stepsData = stepsHandler.getAllData()
  }

  $ctrl.handleRedirect = () => {

    const quoteData = QuoteBuilder.getQuoteData()

    if (!quoteData.categories) {
      stepsHandler.clearAll()
      $state.go('steps.one')
      return
    }

    if (!stepsHandler.isStepCompleted(STEP.ONE)) {
      $state.go('steps.one')
    } else if (!stepsHandler.isStepCompleted(STEP.TWO) && $ctrl.isCarNeeded()) {
      $state.go('steps.two')
    } else if (!stepsHandler.isStepCompleted(STEP.THREE)) {
      $state.go('steps.three')
    } else {
      $state.go('steps.final', {existingQuoteData : $stateParams.existingQuoteData})
    }
  }

  $ctrl.isTabOpened = (step) => {
    const current = $state.current.name
    return current === step
  }

  $ctrl.isTabActive = (number) => {
    const current = $state.current.name
    switch (number) {
      case 1: return current == 'steps.one'
      case 2: return current == 'steps.two'
      case 3: return current == 'steps.three'
      case 4: return current == 'steps.final'
    }
  }

  $ctrl.isStepDone = (number) => {
    if (number == 2 && $ctrl.isCarNeeded() != undefined && !$ctrl.isCarNeeded()) return true
    return stepsHandler.isStepCompleted(number)
  }

  $ctrl.getStepNumber = (number) => {
    let result = (number < 2 || $ctrl.isCarNeeded()) ? number : number - 1
    return result
  }

  $ctrl.isCarNeeded = () => {
    return stepsHandler.isCarNeeded()
  }

  $ctrl.goStepOne = () => {
    $state.go('steps.one')
  }

  $ctrl.goStepTwo = () => {
    if ($ctrl.isStepDone(1)) {
      $state.go('steps.two')
    }
  }

  $ctrl.goStepThree = () => {
    if ($ctrl.isStepDone(1) && $ctrl.isStepDone(2)) {
      $state.go('steps.three')
    }
  }

  $ctrl.goStepFinal = () => {
    if ($ctrl.isStepDone(1) && $ctrl.isStepDone(2) && $ctrl.isStepDone(3)) {
      $state.go('steps.final')
    }
  }

  $ctrl.back = () => {
    if ($ctrl.isTabActive(1)) {
      stepsHandler.clearAll()
      $state.go('home')
    }
    if ($ctrl.isTabActive(2)) {
      $state.go('steps.one')
    }
    if ($ctrl.isTabActive(3)) {
      $ctrl.isCarNeeded() ? $state.go('steps.two') : $state.go('steps.one')
    }
    if ($ctrl.isTabActive(4)) {
      $state.go('steps.three')
    }
  }


  $ctrl.continue = () => {

    if ($ctrl.isTabActive(1)) {
      $('.paso1 .continue').click()
      $ctrl.stepsData = stepsHandler.getAllData()
    }
    if ($ctrl.isTabActive(2)) {
      $('.paso2 .continue').click()
      $ctrl.stepsData = stepsHandler.getAllData()
    }
    if ($ctrl.isTabActive(3)) {
      $('.paso3 .continue').click()
      $ctrl.stepsData = stepsHandler.getAllData()
    }
    if ($ctrl.isTabActive(4)) {
      $('.paso4 .continue').click()
    }
  }

}
