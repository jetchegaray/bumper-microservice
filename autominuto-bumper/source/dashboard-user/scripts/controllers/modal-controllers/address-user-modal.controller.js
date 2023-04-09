angular.module('amApp')
.controller('ShowAddressAmModalController', ['$scope', 'close', 'locationService', 'address', function($scope, close, locationService, address) {
  // Address

  $scope.editAddressId
  $scope.address = address
  $scope.marker
  $scope.types = "['address']"
  $scope.flags = {
    'loadingLocation': false,
    'locationError': false,
    'addressDirty': false,
    'submitted': false
  }

  $scope.init = function(){
    
    if($scope.address){
      $scope.editAddressId = $scope.address.id;
      $scope.rawAddress = locationService.getAddressLine($scope.address);
      $scope.setAddress($scope.address);
    }
  }

  $scope.placeChanged = function() {
    
    $scope.flags.addressDirty = true
    $scope.setAddress(locationService.parseGoogleAddress(this.getPlace()))

  }

  $scope.getLocation = () => {
    $scope.flags.loadingLocation = true
    locationService.getBrowserLocation().then((res) => {
      const coords = {
        lat: res.coords.latitude,
        lng: res.coords.longitude,
      }
      return locationService.geocode(coords)
    })
    .then(googleAddress => {
      const parsedAddress = locationService.parseGoogleAddress(googleAddress)
      $scope.setAddress(parsedAddress)
      $scope.rawAddress = locationService.getAddressLine(parsedAddress)
    })
    .catch(err => {
      $scope.flags.locationError = true
      $timeout(function() { $scope.locationError = false }, 3 * 1000)
    })
    .then(() => {
      $scope.flags.loadingLocation = false
      $scope.flags.addressDirty = true
      $scope.$apply()
    })
  }

  $scope.setAddress = (address) => {
    $scope.address = address
  }

  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

  $scope.addAddress = (result, editAddressId) => {
    //solo se cierra si tiene dirección
    
    if($scope.address){
      result = $scope.address;
      if($scope.editAddressId) result.id = $scope.editAddressId;
      close(result, 500);
    }else{
      $scope.flags.submitted = true;
    }
  }
 
  $scope.init();



}]);