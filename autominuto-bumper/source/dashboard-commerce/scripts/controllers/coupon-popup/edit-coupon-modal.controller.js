'use strict'

angular.module('amApp').controller('EditCouponAmModalController', EditCouponAmModalController)


function EditCouponAmModalController($scope, coupon, action, valueButton, commerceServices, close) {

        $scope.formatDate = "DD-MM-YYYY hh:mm"
 
        $scope.editedCoupon = coupon
        $scope.action = action
        $scope.valueButton = valueButton
        $scope.fileImage = null
        $scope.imagePath = 'assets/images/icons/image-upload.png'
        
        $scope.commerceServices = commerceServices
        $scope.selectedServices = []

        // coupon's properties
        $scope.quantity = (coupon && coupon.quantity) ? coupon.quantity : 1
        $scope.title = coupon ? coupon.title : ""
        $scope.price = coupon ? coupon.price : 0
        $scope.validFrom = coupon ? moment(coupon.validFrom, $scope.formatDate) : moment()
        $scope.validTo = coupon ? moment(coupon.validTo, $scope.formatDate) : moment()
        $scope.minDate = coupon ? moment(coupon.validFrom, $scope.formatDate) : moment()
        $scope.description = coupon ? coupon.description : ""
        $scope.mondayToFridayContraint = coupon ? coupon.mondayToFridayContraint : false
        $scope.justForTodayContraint = coupon ? coupon.justForTodayContraint : false
        $scope.noValidHolidayContraint = coupon ? coupon.noValidHolidayContraint : false
        $scope.noAddedContraint = coupon ? coupon.noAddedContraint : false
        $scope.onePerProductContraint = coupon ? coupon.onePerProductContraint : false
        $scope.customContraints = coupon ? coupon.customContraints : ""

        // popup's property
        $scope.discount = coupon ? coupon.discount : 0

        if(coupon) {
          // select's properties (popup)
          $scope.discountFixedSelected = (coupon.discountFixed > 0)
          $scope.discountPercentageSelected = (coupon.discountPercentage > 0)

          // coupon's property
          $scope.discountFixed = coupon.discountFixed
          $scope.discountPercentage = coupon.discountPercentage

          if(coupon.discountFixed) {
            $scope.priceWithDiscount = coupon.discountFixed
          } else {
            let priceWithDiscount = (1 - (coupon.discountPercentage/100))*coupon.price
            $scope.priceWithDiscount = roundDigits(priceWithDiscount, 2)
          }
       
          $scope.imagePath = coupon.imagePath || $scope.imagePath

          $scope.selectedServices = coupon.services
        } else {
          $scope.discountFixedSelected = false
          $scope.discountPercentageSelected = true
          $scope.priceWithDiscount = 0

          $scope.discountFixed = 0
          $scope.discountPercentage = 0
        }

        $scope.getServicesNames = function () {
          let cad = ""
          if($scope.selectedServices.length) {
            let temp = []
            angular.forEach($scope.selectedServices, function(item) {
              temp.push(item.name)
            })
            cad = temp.join(', ');
            if($scope.selectedServices.length > 1) {
              let position = cad.lastIndexOf(',')
              cad = cad.substring(0, position) + ' y ' + cad.substring(position + 1)
            }
          }

          return cad.toString()
        }

        $scope.selectDiscountFixed = function () {
          $scope.discountPercentageSelected = false
          $scope.discountFixedSelected = true
          $scope.discountPercentage = 0

          $scope.updatePriceWithDiscount()
        }

        $scope.selectDiscountPercentage = function() {
          $scope.discountPercentageSelected = true
          $scope.discountFixedSelected = false
          $scope.discountFixed = 0

          $scope.updatePriceWithDiscount()
        }

        $scope.updatePriceWithDiscount = function() {
          $scope.priceWithDiscount = 0
          $scope.discount = 0

//          if($scope.price) {
            if($scope.discountFixedSelected) {
              if($scope.price > $scope.discountFixed) {
                $scope.priceWithDiscount = $scope.discountFixed
                let discount = (($scope.price - $scope.discountFixed)/$scope.price)*100
                $scope.discount = roundDigits(discount, 2)
              }

            } else {
              let priceWithDiscount = (1 - ($scope.discountPercentage/100))* $scope.price
              $scope.priceWithDiscount = roundDigits(priceWithDiscount, 2)
              $scope.discount = $scope.discountPercentage
            }
  //        }
        }

        function roundDigits(number, digits) {
          let factor = Math.pow(10, digits)
          return Math.round(number*factor)/factor
        }

        $scope.close = function() {
          if($scope.validCoupon()) {
            let coupon = buildCoupon()
            close({ coupon: coupon, action: $scope.action, fileImage: $scope.fileImage}, 500)
          }
        }

        $scope.validCoupon = function () {
          let existsServices = $scope.selectedServices.length > 0
          //let validPrice = $scope.price > 0
          let validQuantity = $scope.quantity >= 1
          let validDiscount = $scope.isValidDiscount()
          let validTittle = $scope.title.length <= 70
          let validDescription = $scope.customContraints.length <= 200
          let validFrom = $scope.validFrom
          let validTo = $scope.validTo

          return existsServices && validQuantity && validDiscount && validTittle && validDescription && validFrom && validTo
        }

        $scope.isValidDiscount = function () {
          if($scope.discountFixedSelected) {
            return $scope.discountFixed > 0 && $scope.price > $scope.discountFixed
          } else {
            return $scope.discountPercentage > 0
          }
        }

        function buildCoupon() {
          let coupon = {
            title: $scope.title,
            price: $scope.price,
            validFrom: $scope.validFrom.format('DD-MM-YYYY hh:mm'),
            validTo: $scope.validTo.format('DD-MM-YYYY hh:mm'),
            description: $scope.description,
            mondayToFridayContraint: $scope.mondayToFridayContraint,
            justForTodayContraint: $scope.justForTodayContraint,
            noValidHolidayContraint: $scope.noValidHolidayContraint,
            noAddedContraint: $scope.noAddedContraint,
            onePerProductContraint: $scope.onePerProductContraint,
            customContraints: $scope.customContraints,
            fileName: "coupon.pdf",  //hardcoded
            quantity: $scope.quantity,
            enabled: true,
            image: null,
          }

          coupon.services = $scope.selectedServices
          coupon.discountFixed = ($scope.discountFixedSelected) ? $scope.discountFixed : 0
          coupon.discountPercentage = ($scope.discountPercentageSelected) ? $scope.discountPercentage : 0

          if($scope.editedCoupon) {
            coupon.id = $scope.editedCoupon.id
            coupon.code = $scope.editedCoupon.code
            coupon.image = $scope.editedCoupon.image
          }
          return coupon
        }
    }