'use strict'

angular.module('amApp').component('tabPieces', {
  templateUrl: 'profile-commerce/views/tab-pieces/tab-pieces.html',
  controller: TabPiecesController,
  bindings: {
    onlyProducts: '<',
    onlyServices: '<',
    data: '<',
    pages: '<',
    allDataFilters: '<'
  }
})

function TabPiecesController(productService, $state, $stateParams, errorService) {
  var $ctrl = this

  $ctrl.rowsList = []
  const limit = 3
  $ctrl.currentPage = 0
  $ctrl.totalPages = 0
  $ctrl.searched = ""
  $ctrl.showFiltersAndSearch = false
  $ctrl.productsLoaded = false

  $ctrl.$onInit = function () {
    $ctrl.resetParamsSearch()

    $ctrl.filters = $ctrl.onlyServices ? [ $ctrl.allDataFilters[0] ] : [ $ctrl.allDataFilters[1] ] 
    $ctrl.productsLoaded = true
    $ctrl.showFiltersAndSearch = true   

    $ctrl.currentPage = 1
    $ctrl.buildRows($ctrl.data)
    $ctrl.totalPages = $ctrl.pages     
    // temporalmente mientras el servicio 'getAllBy' no devuelve filtros, se obtienen desde este servicio
    // el inconeniente es que tanto los servicios y productos se veran en el filtro de categorias
    // y deberia verse solo productos o servicios segun el tab
   /* $.LoadingOverlay("show")
    productService.getInitialDataWithCategories($stateParams.commerceId)
      .then(data => {
        if(data.products.length > 0) {
          $ctrl.productsLoaded = true
          $ctrl.filters = $ctrl.onlyServices ? [ data.filters[0] ] : [ data.filters[1] ] 
          $ctrl.showFiltersAndSearch = true
        }
      })
      .catch(err => {
        errorService.handle(err)
      })
      .then(() => {
        $.LoadingOverlay("hide")
      })
  
    $ctrl.getFilteredProducts(1)*/
  
  }

  $ctrl.resetParamsSearch = () => {
    $ctrl.paramsSearch =  {
      name: "",
      rangePrice: { priceFrom: -1, priceTo: -1 },
      onlyServices: $ctrl.onlyServices,
      onlyProducts: $ctrl.onlyProducts
    }
  }

  $ctrl.removeFilter = type => {
    if(type === 'price') {
      $ctrl.paramsSearch.rangePrice = {priceFrom: -1, priceTo: -1}
    }

    if(type === 'category') {
      delete $ctrl.paramsSearch.serviceTypeId
    }

    $ctrl.getFilteredProducts (1)
  }

  $ctrl.search = () => {
    $ctrl.disabledAllFilters()
    $ctrl.resetParamsSearch()

    $ctrl.paramsSearch.name = $ctrl.searched
    $ctrl.getFilteredProducts(1)
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

    if(param.type === 'price') {
      $ctrl.paramsSearch.rangePrice = { priceFrom:  filter.min, priceTo: filter.max }
    } else {
      // A category filter has this form
      //{levelOne: category.id, levelTwo: son.id, levelThree: grandson.id, name: grandson.name, active: false}

      $ctrl.paramsSearch.serviceTypeId = filter.levelOne
    }
    $ctrl.getFilteredProducts (1)
  }

  $ctrl.getFilteredProducts = (page) => {
    $.LoadingOverlay("show")
    productService.getAllByParamsWithCategoriesLikeProducts($stateParams.commerceId, page, $ctrl.paramsSearch)
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
  }

  $ctrl.loadPage = (page) => {
    if (page === $ctrl.currentPage) return
    $ctrl.getFilteredProducts(page)
  }


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

  $ctrl.goToProductDetails = (product) => {
    $state.go("product_detail",{commerceId : $stateParams.commerceId, productId : product.id})
  }

  $ctrl.searchNoName = () => {
    $ctrl.getAllProducts(1)
  }
}
