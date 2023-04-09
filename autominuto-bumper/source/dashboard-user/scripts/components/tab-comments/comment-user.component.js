'use strict'

angular.module('amApp').component('userDashboardComment', {
  templateUrl: 'dashboard-user/views/tab-comments/comments-user-dashboard.html',
  controller: commentsUserDashboardController,
  bindings: {
    data: '<'
  }
})

function commentsUserDashboardController(localStorageService) {
  var $ctrl = this

  $ctrl.getLinkImage = ($imageUrl) => {
    let image = localStorageService.get("image")
    if (image instanceof Object) {
      image = image.name
    }
    if (!image) image = $imageUrl
    return image
  }

}
