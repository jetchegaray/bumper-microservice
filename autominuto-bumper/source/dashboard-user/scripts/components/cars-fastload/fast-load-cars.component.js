'use strict'

angular.module('amApp').component('fastLoadCars', {
  templateUrl: 'dashboard-user/views/cars-fastload/fast-load-cars.html',
  controller: FastLoadCarsController,
  bindings: {
    refreshCallback: '&'
  }
})

function FastLoadCarsController($scope, $stateParams, userService, $state, errorService) {
  var $ctrl = this

  $ctrl.dataUser = userService.getUserData()

  $ctrl.imagePath = 'assets/images/icons/image-upload.png'
  $ctrl.imageExcelPath = 'assets/images/icons/excel-upload.png'
  $ctrl.imageExcelUploadedPath = 'assets/images/icons/excel-uploaded.png'
  $ctrl.showExcelUploaded = 'assets/images/icons/excel-upload.png';

  $ctrl.fileImage = null
  $ctrl.fileExcel = null

  $ctrl.errorMessage = ''

  $ctrl.$onInit = function () {
  }
  

  $ctrl.checkExcelFile = ()=> {
    if($ctrl.fileExcel){
      var validExts = new Array(".xlsx", ".xls", ".csv")
      var fileExt = $ctrl.fileExcel.name
      fileExt = fileExt.substring(fileExt.lastIndexOf('.'))
      if (validExts.indexOf(fileExt) < 0) {
        $ctrl.fileExcel = null
        $scope.formCars.excel.$error.invalidType = true
      } else {
        $scope.formCars.excel.$error.invalidType = false
      }
    }
  }

  $ctrl.goToCars = () => {
    $state.go("board.user.cars")
  }

  $scope.$watch('$ctrl.fileExcel', () => {
    $ctrl.showExcelUploaded = ($ctrl.fileExcel) ? $ctrl.imageExcelUploadedPath : $ctrl.imageExcelPath;
    $ctrl.errorMessage = ''
  });


  $ctrl.saveCars = () => {

    $.LoadingOverlay('show')
    const userId = userService.getUserData().id
    userService.addCars(userId, $ctrl.fileExcel)
    .then(data => {
       $.LoadingOverlay("hide")
       $ctrl.refreshCallback()
       $state.go("board.user.cars")
    })
    .catch(err => {
      $.LoadingOverlay("hide")
      errorService.handle(err)
    })
  }
 

} 
