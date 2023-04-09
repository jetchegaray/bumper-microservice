'use strict'

angular.module('amApp').component('stepOne', {
  templateUrl: 'steps/views/step-one.html',
  controller: StepOneController,
  bindings: {}
})

function StepOneController(_, anchorSmoothScroll, $state, serviceTypeService, STEP, stepsHandler, $window, $timeout, localStorageService, spinner, $stateParams, ModalService) {

  const $ctrl = this
  const MOST_USED_QUANTITY = 100
  const QUOTE_DATA = 'quote_data'

  //Flags to hide/show most used
  $ctrl.servicesVisible = false
  $ctrl.sparePartsVisible = false

  //Most used
  $ctrl.serviceResult = []

  $ctrl.sparePartsMostUsed = []
  $ctrl.servicesMostUsed = []

  //Service-Product selected by user for quote
  // $ctrl.selectedOption = null

  //Text description
  const desclimit = 100
  $ctrl.descriptionExpanded = false
  $ctrl.descLimit = desclimit

  $ctrl.isProductIncludedChecked = false


  $ctrl.$onInit = () => {

    $window.fbq('track', 'StepOneVisited')

    spinner.start()

    const topServicesSparePartsRequest = serviceTypeService.getAllWithDetails().then(res => {

      spinner.stop()

      $ctrl.serviceResult = JSON.parse(JSON.stringify(res))

      //LABEL (DROPDOWN) AND SORTING ALPHABETICALLY: SHOULD COME FROM THE BACKEND
      _.map($ctrl.serviceResult, s => {s.value = s.id, s.label = s.aliasUser, s.name = s.aliasUser})
      $ctrl.serviceResult = _.sortBy($ctrl.serviceResult, 'label')

      //FILTER EMPTY VALUES. TODO: DO IT IN THE BACKEND
      $ctrl.serviceResult = _.filter($ctrl.serviceResult, s => s.label != '')

      //MOST USED SERVICES & SPARE PARTS: SHOULD COME FROM THE BACKEND
      //javier :: it should be in nodejs this filters
      let i
      for (i = 0; i < $ctrl.serviceResult.length && ($ctrl.sparePartsMostUsed.length < MOST_USED_QUANTITY || $ctrl.servicesMostUsed.length < MOST_USED_QUANTITY); i++) {
        let elem = $ctrl.serviceResult[i]
        if (elem.popularSeasson && elem.service == false && elem.imageName && $ctrl.sparePartsMostUsed.length < MOST_USED_QUANTITY) {
          $ctrl.sparePartsMostUsed.push(elem)
        }
        if (elem.popularSeasson && elem.service == true && elem.imageName && $ctrl.servicesMostUsed.length < MOST_USED_QUANTITY) {
          $ctrl.servicesMostUsed.push(elem)
        }
      }

      let stepOneData = stepsHandler.getStepData(STEP.ONE)

      //Init step data & flags with pre-selected values
      $ctrl.selectedOption = stepOneData
      $ctrl.isProductIncludedChecked = (stepOneData && stepOneData.isProductIncludedChecked != undefined) ? stepOneData.isProductIncludedChecked : $ctrl.isProductIncludedChecked
      let selectService = !$ctrl.selectedOption || ($ctrl.selectedOption && $ctrl.selectedOption.service)
      $ctrl.servicesVisible = selectService
      $ctrl.sparePartsVisible = !selectService


      //if a category comes from parameters
      if ($stateParams.serviceSlug){
        let serviceSlugSelected = _.find($ctrl.serviceResult, s => s.slug == $stateParams.serviceSlug)
        $ctrl.clearSelection()
        $ctrl.selectedOption = serviceSlugSelected
        $ctrl.scrollToExtraFields()
      }

    })

    Promise.all([topServicesSparePartsRequest]).then(() => {
      /*let popupShowed = localStorageService.get('whoWeArePopupShowed')
      if (popupShowed == undefined || !popupShowed && popupShowed != true){
        ModalService.showModal({
          templateUrl: "steps/views/popup-whoweare.html",
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          controller: 'WhoweareAmModalController',
          preClose: (modal) => { modal.element.modal('hide') },
        }).then(function(modal) {
          localStorageService.set('whoWeArePopupShowed', true)
          modal.element.modal()
          modal.close.then(function() {})
        })
  
      } */
      
    })
  }

  $ctrl.showServices = () => {
    $ctrl.servicesVisible = true
    $ctrl.sparePartsVisible = false
  }

  $ctrl.hideServices = () => {
    $ctrl.servicesVisible = false
    $ctrl.sparePartsVisible = true
  }

  $ctrl.selectCategory = (id) => {
    $ctrl.selectOptionFromMostUsed(id)
  }

  $ctrl.selectOptionFromMostUsed = (id) => {
    $ctrl.clearSelection()
    $ctrl.selectedOption = $ctrl.getOptionById(id)
    $ctrl.scrollToExtraFields()
  }

  $ctrl.selectOptionFromList = (isSelected) => {
    if (!isSelected) return
    $ctrl.clearSelection()
    $ctrl.selectedOption = $ctrl.getOptionById($ctrl.selection.value)
    $ctrl.scrollToExtraFields()
  }

  $ctrl.getOptionById = (id) => {
    return _.find($ctrl.serviceResult, s => s.id == id)
  }

  $ctrl.scrollToExtraFields = () => {
    if (!$ctrl.selectedOption.components || !$ctrl.selectedOption.components.length) {
      $ctrl.continue()
      return
    }
    $timeout( function () {anchorSmoothScroll.scrollTo('extra-fields', 50, 10)}, 0) //'extra-fields' -> element | 50 -> offset | 10 -> speed
  }

  $ctrl.isOptionSelected = (id) => {
    return $ctrl.selectedOption && $ctrl.selectedOption.id === id;
  }

  $ctrl.isSomeOptionSelected = () => {
    return $ctrl.selectedOption !== null
  }

  $ctrl.clearSelection = () => {
    $ctrl.selectedOption = null
    $ctrl.descriptionExpanded = false
    $ctrl.descLimit = desclimit
    stepsHandler.setStepData(STEP.ONE, {})
  }

  $ctrl.continue = () => {
    if ($ctrl.isSomeOptionSelected()) {

      //TODO: REFACTOR AND MOVE 3 LINES TO QUOTE BUILDER
      let existingData = localStorageService.get(QUOTE_DATA) || {}
      existingData.categories = $ctrl.selectedOption
      existingData.sparePartIncluded = $ctrl.isProductIncludedChecked
      localStorageService.set(QUOTE_DATA, existingData)
      
      $ctrl.selectedOption.isProductIncludedChecked = $ctrl.isProductIncludedChecked
      stepsHandler.setStepData(STEP.ONE, $ctrl.selectedOption)
      if (stepsHandler.isCarNeeded()) {
        $state.go('steps.two')
      }
      else {
        $state.go('steps.three')
      }
    }
  }

  $ctrl.changeLimit = () => {
    $ctrl.descLimit = $ctrl.selectedOption.description.length
    $ctrl.descriptionExpanded = true
  }

  $ctrl.loadCarousel = (container) => {
    const config = {
      centerMode: true,
      centerPadding: '0',
      slidesToShow: 6,
      autoplay: true,
      autoplaySpeed: 1500,
      responsive: [
        { breakpoint: 768, settings:  { arrows: false, centerMode: true, centerPadding: '40px', slidesToShow: 2}},
        { breakpoint: 480, settings:  { arrows: false, centerMode: true, centerPadding: '20px', slidesToShow: 1,}}
      ],
      // method: {},
      // event: {
      //   init: function (event, slick) {
      //     slick.slickGoTo(3); // slide/jump to index when init - NO FUNCIONA!!!
      //   }
      // }
    }
    const slickSelector = '#' + container + ' .slider';
    $timeout( function () {
      $(slickSelector).slick(config)
    }, 0)
    $(slickSelector).on('click', function () {
      $(slickSelector).slick('slickPause');
    })
  }

}
