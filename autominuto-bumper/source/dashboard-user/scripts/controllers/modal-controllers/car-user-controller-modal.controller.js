angular.module('amApp')
.controller('CarUserAmModalController', ['$scope', 'close', 'homeService', 'userService', 'rawCar', function($scope, close, homeService, userService, rawCar) {

  
  $scope.formatDate = "DD-MM-YYYY hh:mm"
  $scope.licenceExpireDate
  $scope.secureExpireDate
  $scope.extinguisherExpireDate
  $scope.vtvExpireDate
  
  $scope.brands = []
  
  $scope.userInsurancesCompanies = []
  $scope.insuranceSelected
  $scope.editCarId
  $scope.car
  $scope.carForm
  $scope.combustibles = ['NAFTA','DIESEL','GNC','NAFTA_GNC']
  $scope.consumptionTypes = ['RURAL','URBANO','TRANSPORTE_PASAJEROS','LOGISTICA','LOGISTICA_URBANA']
  $scope.alertDeadlines

  $scope.flags = {
    submitted: false
  }

  $scope.init = function() {
    $.LoadingOverlay("show");

    const brandsRequest = homeService.classifiedBrands().then(response => $scope.brands = response.serviceBrands)
    const userInsurancesCompanies = userService.getAllInsurancesCompanies().then(response => $scope.userInsurancesCompanies = response)
    
    // Hide spinner when all requests are resolved
    Promise.all([brandsRequest, userInsurancesCompanies]).then(() => {
      $.LoadingOverlay('hide', true)

      if(rawCar){
        $scope.loadCar(rawCar);
      }

      $scope.$apply()
    })
  }

  $scope.loadCar = (rawCar)=>{
    $scope.car = {
      year : rawCar.year,
      kilometers : rawCar.kilometers,
      fuel : rawCar.fuel,
      fuelConsumptionType : rawCar.fuelConsumptionType,
      engineModel : rawCar.engineModel,
      insuranceNumber : rawCar.insuranceNumber,
      chasisNumber : rawCar.chasisNumber,
      alertDeadlines : rawCar.alertDeadlines
    }

    const brand = _.find($scope.brands, b => b.id == rawCar.brand.id);
    const subBrand = _.find(brand.subbrands, sb => sb.internalId == rawCar.brand.subbrands[0].internalId)

    $scope.insuranceSelected = _.find($scope.userInsurancesCompanies, ic => rawCar.insurance && ic.id == rawCar.insurance.id)
    $scope.carBrandSelected = brand;
    $scope.carSubBrandSelected = subBrand;

    $scope.editCarId = rawCar.id;
    // convierte la fecha string en date para poder cargarla en el form
    $scope.licenceExpireDate = rawCar.licenceExpireDate ? moment(rawCar.licenceExpireDate, 'DD-MM-YYYY') : null
    $scope.secureExpireDate = rawCar.secureExpireDate ? moment(rawCar.secureExpireDate, 'DD-MM-YYYY') : null
    $scope.extinguisherExpireDate = rawCar.extinguisherExpireDate ? moment(rawCar.extinguisherExpireDate, 'DD-MM-YYYY'): null
    $scope.vtvExpireDate = rawCar.vtvExpireDate ? moment(rawCar.vtvExpireDate, 'DD-MM-YYYY') : null  
    $scope.licencePlateExpireDate = rawCar.licencePlateExpireDate ? moment(rawCar.licencePlateExpireDate, 'DD-MM-YYYY') : null  
  }

  $scope.parseDate = (date) => {
    date ? date = date.format($scope.formatDate) : date =  null;
    return date;
  }

  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  }

  $scope.addCar = (result) => {
    if($scope.carForm.$valid){
      $scope.car.idbrand    = $scope.carBrandSelected.id;
      $scope.car.idSubBrand = $scope.carSubBrandSelected.internalId;
      $scope.car.idInsurance = ($scope.insuranceSelected) ? $scope.insuranceSelected.id : null;
      $scope.car.licenceExpireDate = $scope.parseDate($scope.licenceExpireDate);
      $scope.car.secureExpireDate = $scope.parseDate($scope.secureExpireDate);
      $scope.car.extinguisherExpireDate = $scope.parseDate($scope.extinguisherExpireDate);
      $scope.car.vtvExpireDate = $scope.parseDate($scope.vtvExpireDate);
      $scope.car.licencePlateExpireDate = $scope.parseDate($scope.licencePlateExpireDate);

      result = $scope.car;
      if($scope.editCarId) result.id = $scope.editCarId;
      close(result, 500);
    }
  }

  $scope.init()

}])