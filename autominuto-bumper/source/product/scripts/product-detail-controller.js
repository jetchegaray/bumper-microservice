'use strict'

angular.module('amApp').controller('ProductDetailController', ProductDetailController)

function ProductDetailController($state, $stateParams, $window, productService, userService, planService, paymentService, redirectService, errorService) {
  const $ctrl = this

  $ctrl.dataUser = userService.getUserData()

  $ctrl.product = {}
  $ctrl.imageProduct
  $ctrl.productsRelated = []
  $ctrl.discount = 0
  $ctrl.checkoutLink = null
  $ctrl.hasAccountPayment = false
  $ctrl.code = ""

  $ctrl.$onInit = () => {
    if ($stateParams.redirectToMP) {
      $.LoadingOverlay('show')
      const userId = userService.getUserData().id
      paymentService.getCheckoutLink($stateParams.currentProduct, userId, $stateParams.commerceId, $stateParams.quoteId, $stateParams.quoteReplyId, null)
        .then(checkoutLink => $window.location.href = checkoutLink)
        .catch(() => {
          $.LoadingOverlay('hide', true)
        })
    } else {
      $ctrl.getProductAndItsRelated($ctrl.discount, $ctrl.code)
    }
  }

  $ctrl.getProductAndItsRelated = (discount, code) => {
    $.LoadingOverlay('show')
    $ctrl.discount = discount
    $ctrl.code = code

    const findProductRequest = productService.productDetail($stateParams.productId)
      .then(function (data) {
        $ctrl.product = data
        $ctrl.product.price = $ctrl.product.price - ($ctrl.discount * $ctrl.product.price) / 100
        $ctrl.imageProduct = data.mainImage
      })
      .catch(err => {
        //If product does not exist
        if (err &&  err.data && err.data.code == 40417){
          $state.go("error")
        }else {
          errorService.handle(err)
        }
      })

    const  productsRelatedRequest = productService.productsRelated($stateParams.productId)
      .then(data => {
        $ctrl.productsRelated = _.each(data, function(product) {
          product.imageProduct = product.mainImage
        })
      })
      .catch(err => {
        console.log("Error al cargar productos relacionados", err)
      })

    Promise.all([findProductRequest, productsRelatedRequest]).then(() => {
      if (userService.authenticated()) {
        paymentService.getCheckoutLink($ctrl.product, $ctrl.dataUser.id, $stateParams.commerceId, $stateParams.quoteId, $stateParams.quoteReplyId, $ctrl.code)
          .then(checkoutLink => {
            $ctrl.checkoutLink = checkoutLink
            $.LoadingOverlay('hide', true)
          })
          .catch((err) => {
            $.LoadingOverlay('hide', true)
          })
      }
    })

    if (!userService.authenticated()) {
      $ctrl.checkoutLink = '#'
      $.LoadingOverlay('hide', true)
    }
  }

  $ctrl.clickBuyButton = () => {
    if (userService.authenticated()) {
      $window.location.href = $ctrl.checkoutLink
    } else {
      const currentStateName = $state.current.name
      const currentProduct = {}
      Object.assign(currentProduct, $ctrl.product)
      const currentStateParams = {}
      Object.assign(currentStateParams, $stateParams)
      currentStateParams.redirectToMP = true
      currentStateParams.currentProduct = currentProduct
      const callback = () => redirectService.setNextState(currentStateName, currentStateParams)
      redirectService.redirectToLoginAndExecuteCallback(callback)
    }
  }


  $ctrl.validate = () => {
    $.LoadingOverlay("show");
    planService.validate($ctrl.code)
      .then(function (data) {
        $ctrl.discount = data.discount
      })
      .catch(err => {
        $ctrl.validCode = false
        errorService.handle(err)
      })
      .then(() => {
        $ctrl.validCode = true
        $.LoadingOverlay("hide")
      })
  }



/*  $ctrl.getImageFromCategory = category => {
    if (!category.childrens || category.childrens.length == 0)
      return "assets/images/categories/" + category.imageName

    children = category.childrens[0]
    if (!children.childrens || children.childrens.length == 0)
      return "assets/images/categories/" + children.imageName

    grandSon = children.childrens[0]
    return "assets/images/categories/" + grandSon.imageName

  }
*/
  $ctrl.payNow = name => {
    $.LoadingOverlay("show");

  }
}
