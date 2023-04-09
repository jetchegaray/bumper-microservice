'use strict'

angular.module('amApp').controller('ShowCouponAmModalController', ShowCouponAmModalController)

function ShowCouponAmModalController($scope, coupon, close) {

        $scope.formatDate = "DD-MM-YYYY hh:mm"
 
        $scope.quantity = (coupon && coupon.quantity) ? coupon.quantity : 1
        $scope.title = coupon.title
        $scope.price = coupon.price
        $scope.validFrom = moment(coupon.validFrom, $scope.formatDate)
        $scope.validTo = moment(coupon.validTo, $scope.formatDate)
        $scope.description = coupon.description
        $scope.mondayToFridayContraint = coupon.mondayToFridayContraint
        $scope.justForTodayContraint = coupon.justForTodayContraint
        $scope.noValidHolidayContraint = coupon.noValidHolidayContraint
        $scope.noAddedContraint = coupon.noAddedContraint
        $scope.onePerProductContraint = coupon.onePerProductContraint
        $scope.customContraints = coupon.customContraints
        $scope.discount = 0

        $scope.onlyShow = true // hidden button
        
        if(coupon.discountFixed) {
          let discount = ((coupon.price - coupon.discountFixed)/coupon.price)*100
          $scope.discount = Math.round(discount)
          $scope.priceWithDiscount = coupon.discountFixed
        } else {
          let priceWithDiscount = (1 - (coupon.discountPercentage/100))*coupon.price
          priceWithDiscount = Math.round(priceWithDiscount*100)/100
          $scope.priceWithDiscount = priceWithDiscount
          $scope.discount = coupon.discountPercentage
        }

        $scope.getServicesNames = function() {
          let names = []

          for(let index = 0; index < coupon.services.length; index++) {
            let service = coupon.services[index]
            names.push(service.name)
          }
          names = names.join(', ')
          return names
        }

      }