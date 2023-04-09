 'use strict'

angular.module('amApp').component('productComments', {
  templateUrl: 'product/views/product-comments/product-comments.html',
  controller: ProductCommentsController,
  bindings: {
    product : '<'
  }
})

function ProductCommentsController(productService, $stateParams, commentsService, userService, errorService) {
  var $ctrl = this

  $ctrl.firstLoadComments = true
  $ctrl.comments
  $ctrl.currentPage = 0
  $ctrl.days = 0
  const answered = "answered"
  const notAnswered = "notAnswered"
  $ctrl.differenceDays = "differenceDays"
  $ctrl.filterStates = [answered, notAnswered]
  var page = 1

  $ctrl.$onChanges = (changes) => {
    $ctrl.comments = $ctrl.product.questionsComment       
  }

  $ctrl.currentFilter = {
    answered: true,
    notAnswered: true
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

  $ctrl.loadComments = () => {
    $.LoadingOverlay("show")
    productService.getAllComments($stateParams.productId, ++$ctrl.page)
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

  $ctrl.saveComment = (commentItem, comment) => {
    $.LoadingOverlay("show")
    let userId = localStorageService.get("userId")
    productService
      .saveQuestionFrom(commentItem.id, userId, comment)
      .then(() => {
        $ctrl.updateComments(commentItem, comment)
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }


  $ctrl.updateComments = (comment) => {
    let product = $ctrl.product
    let user = userService.getUserData()
    
    $ctrl.comments.push({
      message: comment,
      createdOn: moment.now(),
      userFrom: {
        image: user.imageName,
        userName: user.nickName
      } 
    })
  }


}
