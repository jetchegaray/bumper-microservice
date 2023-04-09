'use strict'

angular.module('amApp').controller('QuoteRatingController', QuoteRatingController)

function QuoteRatingController($state, $stateParams, userService, quoteService, errorService, commerceBrandService) {
  const $ctrl = this
  $ctrl.ratingStar = 0
  $ctrl.ratingComment = ""
  $ctrl.dataUser = userService.getUserData()
  $ctrl.commerceImage = ""

  $ctrl.$onInit = () => {
    $ctrl.findQuoteForRating()

    $ctrl.isReadonly = false;
    $ctrl.changeOnHover = true;
  }

  $ctrl.findQuoteForRating = () => {
     $.LoadingOverlay("show")
     quoteService.findQuoteForRating($stateParams.quoteId)
      .then(function (data) {
        $ctrl.quote = data

        const imageLogo = _.chain($ctrl.quote.commerceImages).filter(function(image){ return image.logo == true}).first().value()
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
    $.LoadingOverlay("show")
    $ctrl.ratingStar = ($ctrl.ratingStar > 5) ? 5 : $ctrl.ratingStar;
    $ctrl.ratingStar = ($ctrl.ratingStar < 1) ? 1 : $ctrl.ratingStar;
  	const rating = {comment: $ctrl.ratingComment, stars: $ctrl.ratingStar}
    quoteService.saveRating($stateParams.quoteId, $ctrl.quote.commerce.id, rating).
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
    if (!$ctrl.quote) {
        return '';
    }
    return commerceBrandService.getCommerceColorType($ctrl.quote.commerce);
  }

}
