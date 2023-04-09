'use strict'

angular.module('amApp').factory('redirectService', redirectService)

function redirectService(userService, localStorageService, errorService, $state, spinner) {

  var nextState = null

  return {
    redirect: redirect,
    setNextState: setNextState,
    clearNextState: clearNextState,
    paramsAvailable: paramsAvailable,
    redirectToLoginAndExecuteCallback: redirectToLoginAndExecuteCallback
  }

  function redirect() {

    const userData = userService.getUserData()
    if (!nextState) {
      nextState = localStorageService.get('nextState')
    }
    if (nextState && nextState.name && nextState.name != 'error') {
      $state.go(nextState.name, nextState.params)
    } else if (userData && !userData.hasCommerce) {
      $state.go('home')
    } else if (userData && userData.hasCommerce == true) {
      spinner.start()
      userService.getCommerces(userData.id, 1)
      .then(res => {
        if (res.total == 1)
          $state.go('board.commerce.profile', { commerceId : res.data[0].id})
        else
          $state.go('addcommerce')
      })
      .catch(err => errorService.handle(err))
      .finally(spinner.stop)

    }
    clearNextState()
  }

  function setNextState(name, params = {}) {
    nextState = {name, params}
    localStorageService.set('nextState', nextState)
  }

  function clearNextState() {
    nextState = null
    localStorageService.remove('nextState')
  }

  function paramsAvailable() {
    return nextState != null || localStorageService.get('nextState') != null
  }

  function redirectToLoginAndExecuteCallback(actionToDo) {

    const action = () => new Promise(resolve => {
      actionToDo()
      resolve()
    })
    const callback = {action}
    setNextState('login', {callback})
    redirect()
  }
}
