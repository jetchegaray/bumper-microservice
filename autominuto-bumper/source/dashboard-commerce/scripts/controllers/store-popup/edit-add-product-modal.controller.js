'use strict'

angular.module('amApp').controller('EditAddProductAmModalController', EditAddProductAmModalController)

function EditAddProductAmModalController($scope, editableProduct, isNew, commerceServices, close) {
        $scope.product = editableProduct
        $scope.product.images = $scope.product.images || []
        $scope.selectedServiceType = undefined
        $scope.isNew = isNew
        $scope.commerceServices = commerceServices

        // vector de archivos de imagenes
        const defaultPath = "assets/images/icons/cargar.png"
        $scope.productImages = [null] // archivos de imagenes
        $scope.pathDefaultProducts = [defaultPath]

        if(!isNew) {
          $scope.selectedServiceType = $scope.product.serviceType
          let images = ($scope.product.images != undefined) ? $scope.product.images : []
          if (images.length > 0){
            $scope.pathDefaultProducts[0] = $scope.product.mainImage
          }
        }

        $scope.updateProductImages = () => {
          $scope.productImages = ($scope.product.service) ? [null] : $scope.productImages
        }

        $scope.getNameImage = index => {
          return index == 0 ? 'primera' : index == 1 ? 'segunda' : index == 2 ? 'tercera' : 'cuarta'
        }

        $scope.isValidForm = function () {
          //return $scope.productForm.$valid
          
          return ($scope.product.service == true && $scope.product.name && $scope.selectedServiceType && $scope.product.price >= 1) ||
          ($scope.product.service == false && $scope.product.name && $scope.product.price >= 1 && $scope.product.stock >= 1 && $scope.selectedServiceType)
        }

        $scope.changeService = function (serviceType) {
           $scope.product.serviceType = serviceType
          //el null es para cuando clickea la cruz en el autocomplete. no tiene elementos
          //este es el que libera el validForm
        }

        /*
          Imagenes del producto: [{name: 'a.png', main: false}, {name: 'b.png', main: false}]
          Si se selecciona una imagen de un archivo en la 2da posicion, en este caso: 'b.png'
          se borrara dicha imagen quedando: [{name: 'a.png', main: false}]
          Usado en la edicion del producto
         */
        $scope.deleteImages = function() {
          let filtered = []

          $scope.productImages.forEach((fileImage, index) => {
            if(fileImage !== null && $scope.pathDefaultProducts[index] !== defaultPath) {
              filtered.push($scope.pathDefaultProducts[index])
            }
          })
          filtered.forEach(value => {
            let index = $scope.product.images.findIndex(image => {
              return image.name === value
            })

            if(index !== -1) {
              $scope.product.images.splice(index, 1)
            }
          })
        }

        $scope.close = function(action) {
          if(action) {
            if(!isNew) {
              $scope.deleteImages()
            }
            close({ isNew: $scope.isNew, product: $scope.product, productImages: $scope.productImages }, 500)
            // Los tags se envian porque en el caso que la edicion sea exitosa se debe
            // armar las categorias con sus respectivos nombres e imagenes
          } else {
            close(null, 500);
          }
        }

      }




