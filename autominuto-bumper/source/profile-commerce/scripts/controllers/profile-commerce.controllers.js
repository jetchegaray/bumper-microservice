'use strict'

angular.module('amApp').controller('ProfileCommerceController', ProfileCommerceController)

function ProfileCommerceController($state, $scope, commerceService, homeService, $stateParams, userService, COMMERCE, localStorageService, 
  modalMessageService, errorService, favoriteService, redirectService, productService, $window, anchorSmoothScroll) {
  var $ctrl = this

  $ctrl.map = COMMERCE.DEFAULT_MAP
  $ctrl.userId = localStorageService.get('userId')
  $ctrl.isFavorite = false
  $ctrl.hasClaim = false

  $ctrl.commerce = null
  $ctrl.products = null
  $ctrl.services = null
  $ctrl.filters = null
  $ctrl.productPages = 0
  $ctrl.servicePages = 0
 
  $ctrl.banner = {}
  $ctrl.isCouponProfile = true
  $ctrl.imageLogoName

  $ctrl.$onInit = function() {
    $.LoadingOverlay("show");

    if ($stateParams.markAsFavoriteBeforeLogin) {
      $ctrl.likeCommerce()
    }

    if ($stateParams.claimCommerceBeforeLogin) {
      $ctrl.claimCommerce()
    }

    const findCommerceRequest = commerceService.findCommerce($stateParams.commerceId)
      .then(data => {
        $ctrl.banner = data
        $ctrl.map = data.location ? commerceService.getCommerceMap(data.location) : COMMERCE.DEFAULT_MAP
        $ctrl.commerce = data

        let imageLogo = _.find(data.images, function(image){ return image.logo})
        let path = (imageLogo) ? imageLogo.path : null

        $ctrl.imageLogoName = path + '?width=105&height=105'

        $ctrl.simpleCommerceData = {name: $ctrl.banner.name, logo: path}
      })
      .catch(data  => {
        errorService.handle(data)
        $.LoadingOverlay('hide', true)
    })

    const productsInitialRequest = productService.getInitialDataWithCategories($stateParams.commerceId)
      .then(data => {
        $ctrl.filters = data.filters
        $ctrl.productPages = data.productPages
        $ctrl.servicePages = data.servicePages  
        $ctrl.products = data.products
        $ctrl.services = data.services

      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })


    const requests = [findCommerceRequest, productsInitialRequest]

    if($ctrl.userId) {
      const isFavoriteRequest = favoriteService.isFavorite($ctrl.userId, $stateParams.commerceId)
        .then(data => {
          $ctrl.isFavorite = data.result === true || data.result === 'true' // backend java return "false"
        })

      requests.push(isFavoriteRequest)

      const  hasClaimRequest = commerceService.hasClaimCommerce($stateParams.commerceId, $ctrl.userId)
      .then(data => { $ctrl.hasClaim = data.result === true || data.result === 'true' })

      requests.push(hasClaimRequest)
    }

    Promise.all(requests).then(() => {
      $.LoadingOverlay('hide', true)
      $window.fbq('track', 'ViewCommerce+'+$stateParams.commerceId)
    }).finally(() => {
      if ($stateParams.activeTab == 'comments') {
        anchorSmoothScroll.scrollTo('group-comments', 90)
      }
    })
  }


  $ctrl.claimCommerce = () => {
    if($ctrl.userId) {

      $.LoadingOverlay("show");
      commerceService.claimCommerce($ctrl.userId, $stateParams.commerceId)
        .then(data => {
          modalMessageService.success('Su solicitud fue realizada con exito !', 'En breve nos pondremos en contacto con usted.', null)
          $ctrl.hasClaim = true
        })
        .catch(message => {
          $ctrl.message = message
        })
        .finally(function() {
          $.LoadingOverlay("hide")
        });
    } else {
      const currentStateName = $state.current.name
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      currentStateParams.claimCommerceBeforeLogin = true
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback)
    }
  }


  $ctrl.likeCommerce = () => {
    if ($ctrl.userId) {
      if($ctrl.isFavorite === false) {
        $.LoadingOverlay("show");
        favoriteService.save($ctrl.userId, $stateParams.commerceId)
          .then(() => {
            $ctrl.isFavorite = true
          })
          .catch(error => {
            $ctrl.message = error
            console.log('Error save Favorite: ', error)
          })
          .finally(function () {
            $.LoadingOverlay("hide")
          })
      }else {
        $.LoadingOverlay("show");
        favoriteService.remove($ctrl.userId, $stateParams.commerceId)
          .then(() => {
            $ctrl.isFavorite = false
          })
          .catch(error => {
            $ctrl.message = error
            console.log('Error save Favorite: ', error)
          })
          .finally(function () {
            $.LoadingOverlay("hide")
          })       
      }
    } else {
      const currentStateName = $state.current.name
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      currentStateParams.markAsFavoriteBeforeLogin = true
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback)
    }
  }

  $ctrl.getSimpleCommerceData = () => {
    return $ctrl.simpleCommerceData
  }

}
