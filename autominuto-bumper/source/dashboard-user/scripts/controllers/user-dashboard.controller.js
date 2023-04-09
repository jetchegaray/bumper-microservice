'use strict'

angular.module('amApp').controller('UserDashboardController', UserBoardController)

function UserBoardController($stateParams, $state, anchorSmoothScroll, userService, locationService, localStorageService, redirectService, $scope, USER, errorService, ModalService, modalMessageService, $window) {
  var $ctrl = this

  $ctrl.percentProfile
  $ctrl.myCommerceId
  $ctrl.userAdresses = []
  $ctrl.userCars = []

  $ctrl.$onInit = function() {
    if (!userService.authenticated()) {
      const currentStateName = $state.current.name
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback)
      return
    }
    $ctrl.loadData();
  }

  $ctrl.loadData = ()=> {
    $.LoadingOverlay('show');
    const userId = localStorageService.get("userId")
    const userViewRequest = userService.userView(userId)
    .then(response => {
        $ctrl.userData = response
        if (response.commercesIds.length > 0){
          $ctrl.myCommerceId =  response.commercesIds[0]
        }

        $ctrl.userAdresses = response.addresses
        $ctrl.userCars = response.cars;
    })
    .catch(err  => errorService.handle(err))

    // Hide spinner when all requests are resolved
    Promise.all([userViewRequest]).then(() => {
      $ctrl.banner = $ctrl.userData
      $ctrl.banner.imageUrl = $ctrl.getLinkImage()

      if ($ctrl.userAdresses.length > 0)
        $ctrl.banner.address = locationService.getAddressLine($ctrl.userAdresses[0])

      $ctrl.map = ($ctrl.userAdresses.length > 0) ? userService.getUserMap($ctrl.userAdresses[0]) : USER.DEFAULT_MAP

      let previousPage = localStorageService.get('previousPage')
      if (previousPage != undefined && previousPage && previousPage.includes('steps.final') ) {
        modalMessageService.success('¡Listo! Tu pedido fue enviado a los comercios cercanos', 'En presupuestos y compras podés seguir el estado de tus solicitudes')
        localStorageService.remove('previousPage')
      }

      $scope.$apply()
    })
    .finally(() => {
      $.LoadingOverlay("hide")
      if ($stateParams.activeTab == 'quotes') {
        $window.fbq('track', 'dashboardUserQuoteView')
        anchorSmoothScroll.scrollTo('quote-content', 90)
      }
    })
  }

  $ctrl.showModalUserData = ()=> {
    ModalService.showModal({
        templateUrl: "dashboard-user/views/tab-profile/modals-view/tmpl-user-data-popup.html",
        backdrop: 'static',
        keyboard: false,
        controller: "UserDataModalController as $ctrl",
        size: 'md',
        windowClass: 'my-modal',
        inputs: {
          userData: $ctrl.userData
        },
        preClose: function(modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then( (result) => {
          if(result){
            let userData = result.userData
            let perfilImage = result.perfilImage

            const userId = localStorageService.get('userId')
            $.LoadingOverlay("show")

            userService.updateUserData(userId, userData, perfilImage).then(data => {
              $ctrl.refreshCallback();
        })
        .catch(err => {
          errorService.handle(err)
        })
        .then(() => {
          $.LoadingOverlay("hide", true)
        })

          }
        })
      });
  }


  $ctrl.refreshCallback = () =>{
    $ctrl.loadData();
  }

  $ctrl.getLinkImage = () => {
    let image = localStorageService.get("image")
    if (image) {
      return image
    }
    if (!image && $ctrl.userData && $ctrl.userData.imageUrl)
      return $ctrl.userData.imageUrl

    return "" //se la asigno de nuevo con la URL completa.
  }


}

