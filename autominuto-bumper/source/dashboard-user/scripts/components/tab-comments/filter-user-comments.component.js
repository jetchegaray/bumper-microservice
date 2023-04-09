'use strict'

angular.module('amApp').component('commentUserFilter', {
  templateUrl: 'dashboard-user/views/tab-comments/comments-user-filter.html',
  controller: filterUserCommentsController,
  bindings: {
    changeFilter: '<',
    sortByDays: '<'
  }
})

function filterUserCommentsController(ModalService) {
  var $ctrl = this

  $ctrl.notAnswered = true
  $ctrl.answered = true

  $ctrl.dates =[{days: 1, text: 'Hoy'}, {days: 7, text: 'Última semana'}, {days: 31, text: 'Último mes'},
    {days: 0, text: "Todos"}]
  $ctrl.type = $ctrl.dates[3]


}
