'use strict'

angular.module('amApp').component('tabUserComments', {
  templateUrl: 'dashboard-user/views/tab-comments/tab-user-comments.html',
  controller: TabUserCommentsController
})

function TabUserCommentsController(userService, $stateParams, localStorageService, errorService) {
  var $ctrl = this

  $ctrl.firstLoadComments = true
  $ctrl.comments = []
  $ctrl.currentPage = 0
  $ctrl.days = 0
  const answered = "answered"
  const notAnswered = "notAnswered"
  $ctrl.differenceDays = "differenceDays"
  $ctrl.filterStates = [answered, notAnswered]
  $ctrl.currentFilter = {
    answered: true,
    notAnswered: true
  }


  $ctrl.$onInit = function () {
    $ctrl.loadComments(1)
  }

  $ctrl.changeFilter = (filter) => {
    $ctrl.currentFilter[filter] = !$ctrl.currentFilter[filter]
  }

  $ctrl.sortByDays = (days) => {
    $ctrl.days = days
  }

  $ctrl.filterComments = (comment) => {
    let state = (comment.answer) ? answered : notAnswered
    //if($ctrl.currentFilter[state]) return comment

    if($ctrl.currentFilter[state]) {
      if($ctrl.showAllDays() || comment.differenceDays < $ctrl.days) {
        return comment
      }
    }
  }

  $ctrl.showAllDays = () => {
    return $ctrl.days === 0
  }

  $ctrl.loadMoreComments = () => {
    $ctrl.loadComments($ctrl.currentPage + 1)
  }

  $ctrl.loadComments = (page) => {
    $.LoadingOverlay("show")
    const userId = localStorageService.get("userId")
    userService.getAllComments(userId, page)
      .then(function (data) {
        $ctrl.firstLoadComments = false

        if(data.data.length) {
          $ctrl.currentPage = page
          $ctrl.comments = $ctrl.comments.concat(data.data)
        }

      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }


}
