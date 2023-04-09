'use strict'

angular.module('amApp').component('commentFilter', {
  templateUrl: 'dashboard-commerce/views/tab-comments/comments-filter.html',
  controller: filterCommentsController,
  bindings: {
    changeFilter: '<',
    sortByDays: '<',
    isProfile: '<'
  }
})

function filterCommentsController($state, $stateParams, ModalService) {
  var $ctrl = this

  $ctrl.notAnswered = true
  $ctrl.answered = true

  $ctrl.dates =[{days: 1, text: 'Hoy'}, {days: 7, text: 'Última semana'}, {days: 31, text: 'Último mes'},
      {days: 0, text: "Todos"}]
  $ctrl.type = $ctrl.dates[3]

  $ctrl.popupRecomendaciones = () => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/popup-recommendations.html",
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      controller: 'RecommendationAmModalController',
      preClose: (modal) => { modal.element.modal('hide') },
    }).then(function(modal) {
      modal.element.modal()
      modal.close.then(function() {
      })
    })
  }


  $ctrl.goToRecommendations = () => {
    $state.go("commerce_recommendation", {commerceId : $stateParams.commerceId})
  }



}
