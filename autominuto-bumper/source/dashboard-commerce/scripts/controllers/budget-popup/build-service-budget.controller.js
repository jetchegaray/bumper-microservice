'use strict'

angular.module('amApp').controller('BuildServiceBudgetController', BuildServiceBudgetController)

function BuildServiceBudgetController($scope, issue, userName, modelCar, sent, showHelpCost, serviceType, possibleAppointments, location, explanations, close, locationService) {

	$scope.issue = issue
    $scope.userName = userName
    $scope.modelCar = modelCar
    $scope.sent = sent
    $scope.datetimes = [{}]
    $scope.cost = ""
    $scope.freeService = false
    $scope.comments = ""
    $scope.opcionalCost = ""
    $scope.opcionalcomments = ""
    $scope.showHelpCost = showHelpCost
    $scope.possibleAppointments = possibleAppointments
    $scope.explanations = explanations

    $scope.appointmentSelected = {}
    $scope.othersAppointments = false
    $scope.location = locationService.getAddressLineWithoutStreet(location)
    $scope.imagePath = 'assets/images/icons/image-upload.png'
    
    $scope.serviceType = serviceType

    $scope.isValidFormQuote = function () {
      if($scope.othersAppointments || $scope.possibleAppointments.length == 0){
        for(let index = 0; index < $scope.datetimes.length; index++) {
          let datetime = $scope.datetimes[index]

          if(!datetime.date || !datetime.time) {
            return false
          }
        }
        return true
      }else{
        if($scope.appointmentSelected && $scope.appointmentSelected.date)
          return true
      }

    }

    $scope.getData = function() {
      let services = {
        cost: $scope.cost || $scope.opcionalCost,
        comments: $scope.comments || $scope.opcionalcomments,
        datetimes: $scope.datetimes,
        appointmentSelected: $scope.appointmentSelected,
        othersAppointments: ($scope.possibleAppointments.length == 0) ? true : $scope.othersAppointments,
        driverAppointments: $scope.possibleAppointments,
        name: $scope.issue.detailIssue,
        quoteable: $scope.issue.quoteable,
        freeService : $scope.freeService
      }

      let result = {
        serviceType: ($scope.serviceType) ? $scope.serviceType : {},
        services: services
      }

      return result;
    }

    $scope.cleanOthersAppointments = () => {
      $scope.othersAppointments = false
    }

    $scope.cleanSelectedAppointments = () =>{
      $scope.appointmentSelected = {}
      $scope.othersAppointments = true
    }

    $scope.close = function(result) {
      result = (result) ? $scope.getData() : null
      close(result, 500); // close, but give 500ms for bootstrap to animate
    }

}
