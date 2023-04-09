'use strict'

angular.module('amApp').controller('CommerceDashboardController', CommerceBoardController)

function CommerceBoardController($scope, commerceService, anchorSmoothScroll, homeService, redirectService, $state, $stateParams, userService, COMMERCE, ModalService, errorService, $window) {
  var $ctrl = this
  $ctrl.dataUser = userService.getUserData()
  $ctrl.map = COMMERCE.DEFAULT_MAP
  $ctrl.isCouponProfile = false
  $ctrl.imageLogoName
  $ctrl.banner = {}


  $ctrl.$onInit = function() {
    if (!userService.authenticated()) {

      $ctrl.myCommerceId = $stateParams.commerceId;

      const currentStateName = $state.current.name
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback)
      return
    }
    

    $.LoadingOverlay('show')

    const findCommerceRequest = commerceService.findOwnerCommerce($stateParams.commerceId, $ctrl.dataUser.id)
      .then(data => {

        if (data.forwarding == true){
          $state.go("board.commerce.profile", {commerceId : data.id})
        }
        $ctrl.banner = data
        $ctrl.map = data.location ? commerceService.getCommerceMap(data.location) : COMMERCE.DEFAULT_MAP

        let imageLogo = _.find(data.images, function(image){ return image.logo == true})

        let path = (imageLogo) ? imageLogo.path : null
        $ctrl.imageLogoName = path + '?width=105&height=105'

        $ctrl.simpleCommerceData = {name: $ctrl.banner.name, logo: path}
      })
      .catch(err  => {
        //40418 -> FAVOURITE_DOES_NOT_EXIST
        //40419 -> commerce no existe en la base.
        //40011 -> el usuario no tiene comercio asociado
        //si el usuario tiene otro comercio redirige a dicho comercio.
        console.log(err)
        if (err.data != undefined && (err.data.code == 40418 || err.data.code == 40419 || err.data.code == 40011))
          $state.go("error")
        else
          errorService.handle(err)
      })

    Promise.all([findCommerceRequest]).then(() => {
      $.LoadingOverlay('hide')
    })
    .finally(() => {
      if ($stateParams.activeTab == 'quotes') {
        $window.fbq('track', 'dashboardCommerceQuoteView')
        anchorSmoothScroll.scrollTo('quote-content', 90)
      }
    })

  }

  $ctrl.getSimpleCommerceData = () => {
    return $ctrl.simpleCommerceData
  }


}
