'use strict'

angular.module('amApp').component('storeTab', {
  templateUrl: 'dashboard-commerce/views/store-tab/store-tab.html',
  controller: StoreTabController,
  bindings: {
    commerceServices : '<'
  }
})

function StoreTabController(productService, $stateParams, localStorageService, paymentService, planService, ModalService, $state, errorService,
  modalMessageService) {
  var $ctrl = this

  $ctrl.rowsList = []
  const limit = 3
  $ctrl.currentPage = 0
  $ctrl.totalPages = 0
  $ctrl.searched = ""
  $ctrl.editableProduct = null
  $ctrl.associatedAccount = 'true'
  $ctrl.authorizationUrl = 'no-url'

  $ctrl.showFiltersAndSearch = false

  $ctrl.$onInit = function () {
    $ctrl.resetParamsSearch()

    $.LoadingOverlay("show")
    const productRequest = productService.getInitialData($stateParams.commerceId)
      .then(data => {
        if(data.products.length > 0) {
          $ctrl.currentPage = 1
          $ctrl.totalPages = data.pages
          $ctrl.showFiltersAndSearch = true
          $ctrl.filters = data.filters
          $ctrl.buildRows(data.products)
        }
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })


    let hasCommerceAccountPaymentMP
    let paymentMethodsRequest
    const paymentRequest = paymentService.hasCommerceAccountPaymentMP($stateParams.commerceId).then((data) => {
      hasCommerceAccountPaymentMP = data.result
      if(hasCommerceAccountPaymentMP == 'false'){
        paymentMethodsRequest = planService.paymentMethodsName()
        .then(function (data) {
          $ctrl.credit_cards = data.credit_cards
          $ctrl.others = data.others
          $ctrl.associatedAccount = hasCommerceAccountPaymentMP
        })
        .catch(err => {
          console.log("Error al obtener las tarjetas: ", err)
        })
      }
    })
    .catch(err => {
      errorService.handle(err)
    })

    const urlAuthorizationRequest = paymentService.getAuthorizationMPUrl($stateParams.commerceId)
      .then((link) => {
        $ctrl.authorizationUrl = link
    })

    Promise.all([productRequest, paymentRequest, urlAuthorizationRequest, paymentMethodsRequest]).then(() => {
      $.LoadingOverlay("hide");
    })

  }

  $ctrl.resetParamsSearch = () => {
    $ctrl.paramsSearch =  { name: "", rangePrice: {priceFrom: -1, priceTo: -1}, onlyServices: false, onlyProducts: false }
  }

  $ctrl.removeFilter = type => {
    if(type === 'price') {
        $ctrl.paramsSearch.rangePrice = {priceFrom: -1, priceTo: -1}
    }

    if(type === 'category') {
      delete $ctrl.paramsSearch.category
    }

    let rangePrice = $ctrl.paramsSearch.rangePrice
    let existsFilterByPrice = rangePrice.priceFrom > 0 && rangePrice.priceTo > 0
    let existsFilterByCategory = $ctrl.paramsSearch.category !== undefined
    let existsFilterByName = $ctrl.paramsSearch.name.length > 0

    if(existsFilterByCategory || existsFilterByName || existsFilterByPrice) {
      $ctrl.getFilteredProducts (1)
    } else {
      $ctrl.getAllProducts(1)
    }
  }

  $ctrl.search = () => {
    $ctrl.disabledAllFilters()
    $ctrl.resetParamsSearch()

    if($ctrl.searched.length) {
      $ctrl.paramsSearch.name = $ctrl.searched
      $ctrl.getFilteredProducts(1)
    } else {
      $ctrl.getAllProducts(1)
    }
  }


  $ctrl.disabledAllFilters = () => {
    angular.forEach($ctrl.filters, function (filter) {
      angular.forEach(filter.values, function (value) {
        value.active = false
      })
    })
  }


  $ctrl.loadProductsWithFilter = param => {
    let filter = param.filter
    $ctrl.paramsSearch.name = $ctrl.searched = ""

    if(param.type === 'price') {
      $ctrl.paramsSearch.rangePrice = { priceFrom:  filter.min, priceTo: filter.max }
    } else {
      $ctrl.paramsSearch.serviceTypeId = filter.levelOne
    }
    $ctrl.getFilteredProducts (1)
  }

  $ctrl.getFilteredProducts = (page) => {
    $.LoadingOverlay("show")
    productService.getAllByParams($stateParams.commerceId, page, $ctrl.paramsSearch)
      .then(data => {
         $ctrl.processPages(data, page)
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.getAllProducts = (page) => {
    $.LoadingOverlay("show")
    productService.getInitialData($stateParams.commerceId, page)
      .then(data => {
        $ctrl.processPages(data, page)
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.processPages = (data, page) => {
    $ctrl.currentPage = page
    $ctrl.buildRows(data.products)
    $ctrl.totalPages = data.pages
    /*
    if(page === 1) {
      // si se carga la pagina inicial se reconstruye el paginado
      $ctrl.totalPages = data.pages
    }
    */
  }

  $ctrl.loadPage = (page) => {
    if (page === $ctrl.currentPage) return

    if ($ctrl.paramsSearch) {
      $ctrl.getFilteredProducts(page)
    } else {
      $ctrl.getAllProducts(page)
    }
  }

  $ctrl.deleteProduct = product => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/popup-delete.html",
      inputs: {
        typeName: product.name,
        type: 'producto'
      },
      controller: 'DeleteProductAmModalController',
      preClose: function(modal) {
        modal.element.modal('hide')
      }
    }).then(function(modal) {
      modal.element.modal()

      modal.close.then(function(result) {
        if(result) {
          $.LoadingOverlay("show")
          productService.deleteProduct(product.id)
            .then(() => {
              let tempList = []
              let deletedProduct = null
              let moreOneProduct = 0
              angular.forEach($ctrl.rowsList, function (row) {
                angular.forEach(row, function (item) {
                  moreOneProduct++
                  if(item.id !== product.id) {
                    tempList.push(item)
                  } else {
                    deletedProduct = item
                  }
                })
              })

         //     if(deletedProduct) $ctrl.updateFiltersAfterDeletingProduct(deletedProduct)
              let page = ($ctrl.currentPage > 1 && moreOneProduct == 1) ? $ctrl.currentPage-1 : $ctrl.currentPage
              $ctrl.getAllProducts(page)
              $ctrl.disabledAllFilters()
              $ctrl.resetParamsSearch()

              //$ctrl.buildRows(tempList)
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

/*
  $ctrl.updateFiltersAfterDeletingProduct = deletedProduct => {
    let levelThreeDeleted = false
    let levelTwoDeleted = false

    angular.forEach($ctrl.filters, function (filter) {

      for(let index = 0; index < filter.values.length; index++) {
        let item = filter.values[index]
        if(deletedProduct.category.id === item.levelOne) {

            if (deletedProduct.category.childrens && deletedProduct.category.childrens.length > 0 && deletedProduct.category.childrens[0].id === item.levelTwo){

              if (deletedProduct.category.childrens[0].childrens && deletedProduct.category.childrens[0].childrens.length > 0
                  && deletedProduct.category.childrens[0].childrens[0].id === item.levelThree && !levelThreeDeleted){
                filter.values.splice(index, 1)
                levelThreeDeleted =  true
              }else if (deletedProduct.category.childrens[0].childrens == null || deletedProduct.category.childrens[0].childrens.length == 0 && !levelTwoDeleted){
                filter.values.splice(index, 1)
                levelTwoDeleted = true
              }
            }
            //for filters just shows level two and three category dispite the object itself has levelOne as a field
          }
      }
    })
  }
*/

  $ctrl.buildRows = (products) => {
    let row = []
    $ctrl.rowsList = []

    angular.forEach(products, function (item) {
      if(row.length < limit) {
        row.push(item)
      }

      if(row.length === limit || item === products[products.length - 1]) {
        $ctrl.rowsList.push(row)
        row = []
      }
    })
  }

  $ctrl.editProduct = product => {
    $ctrl.editableProduct = product
    let editableProduct = angular.copy(product)
    $ctrl.editAddProduct(editableProduct, false)
  }

  $ctrl.editAddProduct = (editableProduct, isNew) => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/store-tab/popup-edit.html",
      inputs: {
        editableProduct: editableProduct,
        isNew: isNew,
        commerceServices : $ctrl.commerceServices
      },
      controller: 'EditAddProductAmModalController',
      preClose: (modal) => { modal.element.modal('hide') }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(results) {
        if(results) {

          if(results.isNew) {
            $.LoadingOverlay("show")
            productService.saveProduct($stateParams.commerceId, { product: results.product }, results.productImages)
              .then(data => {
                $ctrl.$onInit()
              })
              .catch(err => {
                errorService.handle(err)
              })
              .then(() => {
                $ctrl.getAllProducts($ctrl.currentPage)
                $.LoadingOverlay("hide")
              })
          } else {
            $.LoadingOverlay("show")
            productService.editProductStore(results.product.id, { product: results.product}, results.productImages)
              .then(data => {
                // es necesario usar el producto que retorna Node, por la ruta de las imagenes que se puedan usar
                angular.extend($ctrl.editableProduct, data.product)
                $ctrl.editableProduct.serviceType = results.product.serviceType
              })
              .catch(err => {
                errorService.handle(err)
              })
              .then(() => {
                $ctrl.getAllProducts($ctrl.currentPage)
                $.LoadingOverlay("hide")
              })
          }
        }
      })
    })
  }

  $ctrl.selectAddProduct = () => {
    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/store-tab/popup-select-product.html",
      controller: 'SelectAddProductModalController',
      preClose: function(modal) {
        modal.element.modal('hide');
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(results) {
        $ctrl.editAddProduct(results.product, true);
      })
    })
  }

  $ctrl.goToFastload = ()=> {
    $state.go('board.commerce.shop_fastload', {commerceId: $stateParams.commerceId})
  }

  $ctrl.goToMercadoPago = () => {
    window.location.href = $ctrl.authorizationUrl
    $ctrl.associatedAccount = true
  }

  $ctrl.searchNoName = () => {
    $ctrl.getAllProducts(1)
  }

}
