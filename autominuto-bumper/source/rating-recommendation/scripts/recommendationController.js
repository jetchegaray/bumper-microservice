'use strict'

angular.module('amApp').controller('RecommendationController', RecommendationController)

function RecommendationController($state, $stateParams, userService, commerceService, recommendationService, redirectService, localStorageService, modalMessageService, errorService, commerceBrandService) {
  const $ctrl = this
  $ctrl.recommendationStar = 0
  $ctrl.recommendationComment = ""
  $ctrl.userId = localStorageService.get('userId')

  $ctrl.dataUser = userService.getUserData()
  
  $ctrl.$onInit = () => {
  	$ctrl.findCommerce()

    $ctrl.isReadonly = false;
    $ctrl.changeOnHover = true;
  }

  $ctrl.findCommerce = () => {
     $.LoadingOverlay("show");  
     commerceService.findCommerce($stateParams.commerceId)
      .then(function (data) {
        const imageLogo = _.chain(data.images).filter(function(image){ return image.logo == true;}).first().value()
        $ctrl.commerceImage = imageLogo.path

        // used to add commerce acceptance and rejection responses without refreshing the screen
        $ctrl.simpleCommerceData = {
          name: data.name, 
          logo: imageLogo.path, 
          location: data.location, 
          webSite: data.commerceWeb, 
          facebook: data.facebook, 
          twitter: data.twitter,
          sparePartsOfficialBrands: data.sparePartsOfficialBrands,
          serviceOfficialBrands: data.serviceOfficialBrands
        } 
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        //went to login and went back ?
        if ($stateParams.savedRecommendation) {
          $ctrl.recommendationComment = $stateParams.savedRecommendation.comment
          $ctrl.recommendationStar = $stateParams.savedRecommendation.stars
          $ctrl.saveRecommendation()
        }
        $.LoadingOverlay("hide")
      })
  }


  $ctrl.saveRecommendation = () => {
    $.LoadingOverlay("show");
    $ctrl.recommendationStar = ($ctrl.recommendationStar > 5) ? 5 : $ctrl.recommendationStar;
    $ctrl.recommendationStar = ($ctrl.recommendationStar < 1) ? 1 : $ctrl.recommendationStar;
    const recommendation = {comment: $ctrl.recommendationComment, stars: $ctrl.recommendationStar}
   
    recommendationService.save($stateParams.commerceId, recommendation).
  	  then(function (data) {
       modalMessageService.success('Tu recomendación se envío con éxito ! ' , '', () => $state.go("profile_commerce_comments", {commerceId : $stateParams.commerceId}) )
  //      $state.go("profile_commerce_comments", {commerceId : $stateParams.commerceId})
      })
      .catch(data => {
        if (data.status === 401) {
            const currentStateName = $state.current.name
            const currentStateParams = {}
            Object.assign(currentStateParams, $stateParams)
    
            const savedRecommendation = {}
            Object.assign(savedRecommendation, recommendation)
            currentStateParams.savedRecommendation = savedRecommendation
            const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
            redirectService.redirectToLoginAndExecuteCallback(callback)
        } else {
          errorService.handle(data)
        }
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.getCommerceColorType = () => {
    if (!$ctrl.simpleCommerceData) {
        return '';
    }
    return commerceBrandService.getCommerceColorType($ctrl.simpleCommerceData);
  }  

}
