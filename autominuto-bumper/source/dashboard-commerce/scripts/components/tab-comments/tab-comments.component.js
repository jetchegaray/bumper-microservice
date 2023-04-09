 'use strict'

angular.module('amApp').component('tabComments', {
  templateUrl: 'dashboard-commerce/views/tab-comments/tab-comments.html',
  controller: TabCommentsController,
  bindings: {
    getDataCommerce: '<',
    isProfile: '<'
  }
})

function TabCommentsController($state, commerceService, $stateParams, commentsService, localStorageService, userService, redirectService, errorService, modalMessageService) {
  var $ctrl = this

  $ctrl.firstLoadComments = true
  $ctrl.comments = []
  $ctrl.currentPage = 0
  $ctrl.days = 0
  const answered = "answered"
  const notAnswered = "notAnswered"
  $ctrl.differenceDays = "differenceDays"
   $ctrl.totalPages = 0
  $ctrl.filterStates = [answered, notAnswered]
  $ctrl.currentFilter = {
    answered: true,
    notAnswered: true
  }


  $ctrl.$onInit = function () {
    $ctrl.loadComments(1).then(() => {
      if ($stateParams.newComment) {
        $ctrl.saveQuestion($stateParams.newComment)
      }
    })
  }

  $ctrl.getDataCommerceTab = () => {
    return $ctrl.getDataCommerce
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
    return commerceService.getAllComments($stateParams.commerceId, page)
      .then(function (data) {
        $ctrl.firstLoadComments = false

        if(data.data.length) {
          $ctrl.totalPages = data.pages
          $ctrl.currentPage = page
          $ctrl.comments = $ctrl.comments.concat(data.data)
        }
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide", true)
      })
  }


  $ctrl.replyComment = (commentItem, answer) => {
    $.LoadingOverlay("show")

    commentsService
      .saveAnswerCommerce(commentItem.id, answer)
      .then(() => {
        $ctrl.updateComments(commentItem, answer)
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide", true)
      })
  }


  $ctrl.saveQuestion = (newComment) => {
    $.LoadingOverlay("show")
    let userId = localStorageService.get("userId")

    commerceService
      .saveQuestionFrom($stateParams.commerceId, userId, newComment)
      .then(() => {
        $ctrl.updateNewComments(newComment)
        $ctrl.sendQuestion = true
        $.LoadingOverlay("hide")
        modalMessageService.success('Tu pregunta fue enviada con éxito', `Recordá que podes seguir tus preguntas y respuestas desde tu perfil de usuario en la seccion preguntas`, null)
      })
      .catch(err => {
        if (err.status === 401) {
          const currentStateName = $state.current.name
          const currentStateParams = {}
          Object.assign(currentStateParams, $stateParams)
          currentStateParams.newComment = newComment
          const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
          redirectService.redirectToLoginAndExecuteCallback(callback)
        }else {
          errorService.handle(err)
        }
        $.LoadingOverlay("hide", true)
      })
  }


  $ctrl.updateNewComments = (comment) => {
    let user = userService.getUserData()

    $ctrl.comments.unshift({
      message: comment,
      createdOn: moment.now(),
      userFrom: {
        username : user.nickName,
        image : user.image
      },
      answer: null,
      differenceDays : 0
    })
  }

  //$ctrl.getLinkImage = () => {
  //  let image = localStorageService.get("image")
  //  if (image instanceof Object) {
  //    image = image.name
  //  }
  //  if (!image) image = $ctrl.banner.imageUrl + '?width=200&height=200'
  //  $ctrl.banner.imageUrl = image //se la asigno de nuevo con la URL completa.
  //}

  $ctrl.updateComments = (comment, answer) => {
    let commerce = $ctrl.getDataCommerce()

    comment.answer = {
      message: answer,
      createdOn: moment.now(),
      differenceDays : 0,
      commerceName: commerce.name,
      logo: commerce.logo
    }
  }
}
