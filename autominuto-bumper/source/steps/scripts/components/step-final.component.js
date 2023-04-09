 'use strict'

angular.module('amApp').component('stepFinal', {
  templateUrl: 'steps/views/step-final.html',
  controller: StepFinalController,
  bindings: {
    stepsData: '='
  }
})

function StepFinalController(
  anchorSmoothScroll,
  localStorageService,
  modalMessageService,
  QuoteBuilder,
  quoteService,
  redirectService,
  searchService,
  userService,
  spinner,
  stepsHandler,
  STEP,
  $state,
  $stateParams,
  $window,
  $scope,
  $timeout,
  errorService) {

  const $ctrl = this

  $ctrl.$onInit = () => {

    $window.fbq('track', 'StepFinalVisited')

    if ($stateParams.existingQuoteData) {
      const quoteData = QuoteBuilder.getQuoteData()
      saveQuotes(quoteData)
    } else {

      if ($ctrl.stepsData && $ctrl.stepsData != null){
        $ctrl.setQuoteValues()

      }
    }
    anchorSmoothScroll.scrollTo('paso4', 70)
  }

  $scope.$watch('$ctrl.stepsData[1].data', () => {
    $ctrl.setQuoteValues()
  })
  $scope.$watch('$ctrl.stepsData[2].data', () => {
    $ctrl.setQuoteValues()
  })
  $scope.$watch('$ctrl.stepsData[3].data', () => {
    $ctrl.setQuoteValues()
  })

  $ctrl.setQuoteValues = () => {

    let quoteData = QuoteBuilder.getQuoteData()

    if (quoteData && quoteData.categories.name){
      $ctrl.issue = quoteData.categories.name
      $ctrl.brand = quoteData.brandName
      $ctrl.model = quoteData.SubBrandName
      $ctrl.vin = quoteData.chasisNumber
      $ctrl.year = quoteData.carYear
      $ctrl.location = QuoteBuilder.buildSimpleLocation(quoteData.location)
      $ctrl.comments = stepsHandler.getStepData(STEP.FOUR).comments
    }
  }

  $ctrl.quote = () => {

    const quoteData = QuoteBuilder.getQuoteData()

    if ($ctrl.comments) {
      stepsHandler.setStepData(STEP.FOUR, {comments: $ctrl.comments})
      quoteData.explanations = $ctrl.comments
      QuoteBuilder.addExplanations($ctrl.comments)
    }

    if (!userService.authenticated()) {
      $state.go("register_driver")
   /*   const currentStateName = $state.current.name
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      const currentQuoteData = {}
      Object.assign(currentQuoteData, quoteData)
      currentStateParams.existingQuoteData = currentQuoteData
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback) */
    } else {
      saveQuotes(quoteData)
    }
  }

  $ctrl.isNotProductCategory = () => {
    return stepsHandler.getStepData(STEP.ONE).service
  }

  $ctrl.isCarNeeded = () => {
    return stepsHandler.isCarNeeded()
  }

  $ctrl.back = () => {
     $state.go('steps.three')
  }

  const saveQuotes = quoteData => {
    spinner.start()
    let builtQuoteData = QuoteBuilder.buildDataForSavingQuote(quoteData)

    quoteService.saveQuotes(builtQuoteData, builtQuoteData.imagesList)
      .then(res => {

        $window.fbq('track', 'StepFinalCompleted')

        stepsHandler.clearAll()
        localStorageService.remove('quote_data')
        localStorageService.set('previousPage', $state.current.name)

        $state.go('board.user.quotes');

        // no importa que este servicio devuelva los comercios oficiales (campos officialBranding)
        // porque la pagina de resultados debe llamar al servicio search que trae nuevamente el campo officialBrading
        // de modo que es innecesario guardarlo en el objeto en este modulo
        // quizas la idea fue guardarlo para mostrarlo inmediatamente al cargar la pagina de resultados mientras carga el servicios seach
        // pero a resultado se puede llegar desde la pantalla de busqueda (modal home) o copiando la url, asique se uniformizará
        // el comportamiento...
      })
      .catch (err => {
        $window.fbq('track', 'StepFinalError')
        stepsHandler.clearAll()

        localStorageService.remove('quote_data')
        //{"data":{"code":40421,"httpStatus":400,"description":"EL pedido de presupuesto no posee resultados","moreInfoURL":"/error/40421"},"status":400
        if (err && err && err.code == 40421){
          modalMessageService.error('Intentalo de nuevo !!', "No existen comercios disponibles para responder este pedido de cotización", () => { $state.go('steps.one')} )
        } else {
          errorService.handle(err)
        }
      })
      .finally (
        () => spinner.stop()
      )
  }
}
