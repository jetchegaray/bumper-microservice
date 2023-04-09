'use strict'

angular.module('amApp').controller('BuildProductBudgetController', BuildProductBudgetController)

function BuildProductBudgetController($scope, issue, userName, modelCar, sent, showHelpCost, serviceType, possibleAppointments, location, explanations, close, locationService) {
	  $scope.issue = issue
    $scope.userName = userName
    $scope.modelCar = modelCar
    $scope.sent = sent
    $scope.showHelpCost = showHelpCost
    $scope.serviceType = serviceType
    $scope.explanations = explanations

    // for add new product
    $scope.loadingProduct = false

    $scope.location = locationService.getAddressLineWithoutStreet(location) 
    $scope.imagePath = 'assets/images/icons/image-upload.png'
    $scope.checkAddProductsToStore = false
    /*
      Inicio de la seccion de creacion del producto
     */

    $scope.fileImages = []
    $scope.products = []
    $scope.products.push(buildEmptyProduct())

    // stores the selected categories
    $scope.selectedServiceType = {value : null}

    // vector de archivos de imagenes
    const defaultPath = "assets/images/icons/cargar.png"
    $scope.productImages = [null] // archivos de imagenes
    $scope.pathDefaultProducts = [defaultPath]

    $scope.updateProductImages = () => {
      $scope.productImages = ($scope.product.service) ? [null] : $scope.productImages
    }


    $scope.addNewProduct = () => {
      $scope.products.push(buildEmptyProduct())
    }

    $scope.removeDataProduct = (pos) => {
      if(pos < $scope.products.length){
        $scope.products.splice(pos, 1)
      }
    }

    $scope.isValidFormProduct = function () {
      return $scope.product.name.length > 0 && $scope.product.price >= 1
    }

    /*
      Fin de la seccion de creacion de un producto
     */

    function getData() {
      let products = []

      angular.forEach($scope.products, function(key, value){
        this.push({
        	  'name': key.name,
            'price': key.price, 
            'description': key.description,
            'service': false,
            'code': key.code,
            'temporaryBrand': key.temporaryBrand
          }
        )
      }, products)
      let result = {
        serviceType: ($scope.serviceType) ? $scope.serviceType : {},
        services: products,
        fileImages: $scope.fileImages,
        saveThemAtStore: $scope.checkAddProductsToStore
      }
      return result
    }

    $scope.close = function(result) {
      result = (result) ? getData() : null
      close(result, 500); // close, but give 500ms for bootstrap to animate
    }

    function buildEmptyProduct(){
      return {
        name: null,
        temporaryBrand: null,
        code: null,
        price: null,
        description: null,
        images: []
      }
    }
}