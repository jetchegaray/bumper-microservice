'use strict'

angular.module('amApp').controller('BoughtRatingController', BoughtRatingController)

function BoughtRatingController($state, $stateParams, userService, paymentService, errorService, commerceBrandService) {
  const $ctrl = this
  $ctrl.ratingStar = 0
  $ctrl.ratingComment = ""
  $ctrl.dataUser = userService.getUserData()
  $ctrl.commerceImage = ""

  $ctrl.$onInit = () => {
    $ctrl.findBoughtForRating()

    $ctrl.isReadonly = false;
    $ctrl.changeOnHover = true;
  }

  $ctrl.findBoughtForRating = () => {
     $.LoadingOverlay("show")
     paymentService.findPayment($stateParams.paymentId)
      .then(function (data) {
        $ctrl.payment = data

        const imageLogo = _.chain($ctrl.payment.commerceImages).filter(function(image){ return image.logo == true;}).first().value()
        $ctrl.commerceImage = imageLogo.path
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.saveRating = () => {
    $ctrl.ratingStar = ($ctrl.ratingStar > 5) ? 5 : $ctrl.ratingStar;
    $ctrl.ratingStar = ($ctrl.ratingStar < 1) ? 1 : $ctrl.ratingStar;
  	const rating = {comment: $ctrl.ratingComment, stars: $ctrl.ratingStar}

    paymentService.saveRating($stateParams.paymentId, rating).
  	  then(function (data) {
        $state.go("board.user.quotes")
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.getCommerceColorType = () => {
    if (!$ctrl.payment) {
        return '';
    }
    return commerceBrandService.getCommerceColorType(ctrl.payment.commerceView);
  }
}
