'use strict'

angular.module('amApp').component('productComment', {
  templateUrl: 'product/views/product-comments/comments-product.html',
  controller: productCommentsDashboardController,
  bindings: {
    data: '<',
    saveComment: '<',
    getProduct: '<'
  }
})

function productCommentsDashboardController() {
  var $ctrl = this

  $ctrl.limit = 300
  $ctrl.visibleCommentEntry = false
  $ctrl.answer = ""
  $ctrl.remainingComment = $ctrl.limit

  $ctrl.showCommentEntry = () => {
    if(!$ctrl.answerButtonIsActive()) return
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

}
