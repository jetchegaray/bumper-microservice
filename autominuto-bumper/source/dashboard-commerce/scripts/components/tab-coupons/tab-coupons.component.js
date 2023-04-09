  'use strict'

angular.module('amApp').component('tabCoupons', {
  templateUrl: 'dashboard-commerce/views/tab-coupons/tab-coupons.html',
  controller: TabCouponsController,
  bindings: {
    commerceServices: '<',
    profile:'<'
  }
})

function TabCouponsController($stateParams, $state, ModalService, couponService, errorService, localStorageService, 
  redirectService, $window, modalMessageService, userService, anchorSmoothScroll) {
  var $ctrl = this
  $ctrl.coupons = []
  $ctrl.currentPage = 0
  $ctrl.totalPages = 0
  $ctrl.formatDate = "DD-MM-YYYY hh:mm"
  $ctrl.userId = localStorageService.get('userId')
  $ctrl.filterStates = {
    showPack: true,
    showCoupons: true
  }
  $ctrl.isLoadingCoupons = true
  $ctrl.orderByParam = "discount"
  $ctrl.currentOrder = true // true: asc, false: desc

  $ctrl.$onInit = function () {
    if ($stateParams.pendingCoupon) {
      $ctrl.showBuyCoupon($stateParams.pendingCoupon)
    } else {
      $ctrl.getCouponsByPage(1)
    }
    anchorSmoothScroll.scrollTo('cupon-options', 90)
  }

  $ctrl.getCouponsByPage = page => {
    $.LoadingOverlay("show")
    couponService.getCouponsByCommerce($stateParams.commerceId, page)
      .then(data => {

        $ctrl.currentPage = page
        $ctrl.totalPages = data.pages
        $ctrl.coupons = data.coupons
        $ctrl.isLoadingCoupons = false
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.showBuyCoupon = (coupon) => {
    $.LoadingOverlay("show")
  
     if (!userService.authenticated()) {
        const currentStateName = $state.current.name
        const pendingCoupon = {}
        Object.assign(pendingCoupon, coupon)
        const currentStateParams = {}
        Object.assign(currentStateParams, $stateParams)
        currentStateParams.pendingCoupon = pendingCoupon
        const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
        redirectService.redirectToLoginAndExecuteCallback(callback)
    } else {
       /*couponService.buyPaymentCoupon(coupon.id, $stateParams.commerceId, $ctrl.userId)
       .then(data => {
          $.LoadingOverlay("show")
          if (data.status === 201){
            $window.location.href = data.response.init_point
          }
       })
        .catch(err => {
          errorService.handle(err)
          $.LoadingOverlay("hide")
        }) */

        couponService.buyCoupon(coupon.id, $ctrl.userId)
        .then(data => {
          modalMessageService.success('¡Listo, el cupón es tuyo !', `Encontrá tu cupón en tu perfil de usuario en la sección cupones y packs y presentalo en el comercio al pagar por el servicio/producto`, null)
          $.LoadingOverlay("hide")
        })
        .catch(err => {
          errorService.handle(err)
          $.LoadingOverlay("hide")
        })
    }
   
  }

  $ctrl.updateSortByDscto = () => {
    $ctrl.currentOrder = !$ctrl.currentOrder
  }

  $ctrl.applyCouponFilter = coupon => {
   if ($ctrl.filterStates.showPack === true && $ctrl.filterStates.showCoupons === true)
      return true
    if ($ctrl.filterStates.showPack === false && $ctrl.filterStates.showCoupons === false)
      return false
    if ($ctrl.filterStates.showPack === true && $ctrl.filterStates.showPack == coupon.isPack)
      return coupon
    if ($ctrl.filterStates.showCoupons === true && coupon.isPack == false)
      return coupon
  }

  $ctrl.loadPage = (page) => {
    if (page === $ctrl.currentPage) return
    $ctrl.getCouponsByPage(page)
  }


  $ctrl.showDeleteCoupon = (coupon) => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/popup-delete.html",
      inputs: {
        typeName: coupon.code,
        type: 'cupón'
      },
      controller: 'DeleteCouponAmModalController',
      preClose: (modal) => { modal.element.modal('hide') },
    }).then(function(modal) {
      modal.element.modal()

      modal.close.then(function(result) {
        if(result) {
          $.LoadingOverlay("show")
          couponService.deleteCoupon(coupon.id)
            .then(() => {
              for(let index = 0; index < $ctrl.coupons.length; index++) {
                if(coupon.id === $ctrl.coupons[index].id) {
                  $ctrl.coupons.splice(index, 1)
                  break;
                }
              }
            })
            .catch(err => {
              errorService.handle(err)
            })
            .then(() => {
              $.LoadingOverlay("hide")
            })
        }
      })
    })
  }

  $ctrl.showCoupon = (coupon) => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-coupons/popups/show-coupon.html",
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      windowClass: 'my-modal',
      inputs: {
        coupon: coupon
      },
      controller: 'ShowCouponAmModalController'
    }).then(function (modal) {
      modal.element.modal();
    });
  }
  
  $ctrl.showAddEditCoupon = coupon => {
    let action = (coupon === null) ? "Nuevo": "Editar"
    let valueButton = (coupon === null) ? "Crear Cupón" : "Guardar cambios"
  
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-coupons/popups/new-coupon.html",
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      windowClass: 'my-modal',
      inputs: {
        coupon: coupon,
        action: action,
        valueButton: valueButton,
        commerceServices : $ctrl.commerceServices
      },
      controller: 'EditCouponAmModalController',
      preClose: function(modal) {
        modal.element.modal('hide')
      }
    }).then(function (modal) {
      modal.element.modal();

      modal.close.then(function(results) {
        let coupon = results.coupon
        if(results.action === "Nuevo") {
          $.LoadingOverlay("show")
          couponService.createCoupon($stateParams.commerceId, coupon, results.fileImage)
            .then(() => {
              $ctrl.getCouponsByPage(1)
            })
            .catch(err => {

              if (err.code == 4052){ // "quote plan error. amount of coupons
                modalMessageService.error('Actualiza tu plan !', err.description)
              }else {
               errorService.handle(err)
              }
            })
            .finally(() => {
              $.LoadingOverlay("hide")
            })
        } else {

          $.LoadingOverlay("show")
          couponService.editCoupon($stateParams.commerceId, coupon, results.fileImage)
            .then((data) => {

              for(let index = 0; index < $ctrl.coupons.length; index++) {
                if($ctrl.coupons[index].id === data.coupon.id) {
                  $ctrl.coupons[index] = data.coupon
                  break
                }
              }
            })
            .catch(err => {
              errorService.handle(err)
            })
            .finally(() => {
              $.LoadingOverlay("hide")
            })
        }

      })
    });
  }




}
