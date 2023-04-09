'use strict'

angular.module('amApp').factory('stepsHandler', stepsHandler)

function stepsHandler(localStorageService, locationService, STEP) {

  // Default values for steps data //it's not a constant . this value change it called setStepData.. change this variable
  //ObectFrezze we should use and it's not recursive.. if we use it we should use it in internal objects as well
  const initial = {
    1: {completed: false, data: null},
    2: {completed: false, data: [{}]},
    3: {completed: false, data: {address: locationService.getDefaultLocation(), rawAddress: '', datetimes: [{}]}},
    4: {completed: false, data: [{}]}
  }

  
  var steps = JSON.parse(localStorageService.get('stepsHandler')) || angular.copy(initial)

  return {
    isStepCompleted: isStepCompleted,
    setStepCompleted: setStepCompleted,
    getStepData: getStepData,
    setStepData: setStepData,
    getAllData: getAllData,
    isCarNeeded: isCarNeeded,
    clearStepData: clearStepData,
    clearAll: clearAll,
    // addAdvancedIssue : addAdvancedIssue,
  }

  function isStepCompleted(number) {
    return steps[number].completed
  }

  function setStepCompleted(number, completed) {
    steps[number].completed = completed
    updateLocalStorage()
  }

  function getStepData(number) {
    return steps[number].data
  }

  function setStepData(number, data) {
    steps[number].data = data
    steps[number].completed = true
    updateLocalStorage()
  }

  function getAllData() {
    return steps
  }

  function clearStepData(number) {
    steps[number].data = angular.copy(initial[number].data)
    updateLocalStorage()
  }

  function clearAll() {
    localStorageService.remove('stepsHandler')
    steps = angular.copy(initial)
    updateLocalStorage()
  }

  function updateLocalStorage() {
    localStorageService.set('stepsHandler', JSON.stringify(steps))
  }

  function isCarNeeded () {
    let selectedOptionFirstStep = this.getStepData(STEP.ONE)
    return selectedOptionFirstStep && selectedOptionFirstStep.carNeeded
  }
}