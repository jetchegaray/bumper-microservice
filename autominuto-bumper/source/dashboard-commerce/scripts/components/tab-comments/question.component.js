'use strict'

angular.module('amApp').component('userQuestionComment', {
  templateUrl: 'dashboard-commerce/views/tab-comments/question-user.html',
  controller: commentsQuestionsDashboardController,
  bindings: {
    getCommerce: '<',
    saveComment: '<'
  }
})

function commentsQuestionsDashboardController(localStorageService) {
	var $ctrl = this

	$ctrl.limit = 300
	$ctrl.visibleCommentEntry = false
	$ctrl.newComment = ""
	$ctrl.remainingComment = $ctrl.limit 

	$ctrl.updateRemainingComment = () => {
		$ctrl.remainingComment = $ctrl.limit - $ctrl.newComment.length
	}

	$ctrl.saveQuestion = () => {
		if (!$ctrl.newComment.length) return
		$ctrl.saveComment($ctrl.newComment)
	}
}