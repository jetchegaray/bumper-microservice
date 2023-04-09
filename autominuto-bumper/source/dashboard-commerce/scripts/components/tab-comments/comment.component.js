'use strict'

angular.module('amApp').component('userComment', {
  templateUrl: 'dashboard-commerce/views/tab-comments/comments-user.html',
  controller: commentsDashboardController,
  bindings: {
    data: '<',
    replyComment: '<',
    getCommerce: '<',
    isProfile: '<',
    saveComment: '<'
  }
})

function commentsDashboardController(localStorageService, userService) {
  var $ctrl = this

  $ctrl.limit = 300
  $ctrl.visibleCommentEntry = false
  $ctrl.answer = ""
  $ctrl.remainingComment = $ctrl.limit
  $ctrl.newComment = ""

  $ctrl.showCommentEntry = () => {
    if(!$ctrl.answerButtonIsActive() || $ctrl.isProfile) return
    $ctrl.visibleCommentEntry= true
  }

  $ctrl.hideCommentEntry = () => {
    $ctrl.visibleCommentEntry= false
  }

  $ctrl.updateRemainingComment = () => {
    $ctrl.remainingComment = $ctrl.limit - $ctrl.answer.length
  }

  $ctrl.answerButtonIsActive = () => {
    return $ctrl.data.answer === null && !$ctrl.visibleCommentEntry
  }

  $ctrl.sendReply = () => {
    $ctrl.replyComment($ctrl.data, $ctrl.answer)
  }
  

  $ctrl.saveQuestion = () => {
    if (!$ctrl.newComment.length) return
    $ctrl.saveComment($ctrl.newComment)
  }

}
