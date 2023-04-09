'use strict'

angular.module('amApp').controller('FastLoadCommerceController', FastLoadCommerceController)

function FastLoadCommerceController($scope, $stateParams, userService, $state,
                                    productService, errorService) {

	var $ctrl = this
	$ctrl.dataUser = userService.getUserData()

	$ctrl.imagePath = 'assets/images/icons/image-upload.png'
	$ctrl.imageExcelPath = 'assets/images/icons/excel-upload.png'
	$ctrl.imageExcelUploadedPath = 'assets/images/icons/excel-uploaded.png'
  $ctrl.showExcelUploaded = 'assets/images/icons/excel-upload.png';

  $ctrl.fileImage = null
  $ctrl.fileExcel = null

  $ctrl.errorMessage = ''
  /*

  ** formato del excel **

  nombre  descripcion marca categoria stock precio  codigo

  */

  $ctrl.checkExcelFile = ()=> {
    if($ctrl.fileExcel){
      var validExts = new Array(".xlsx", ".xls", ".csv")
      var fileExt = $ctrl.fileExcel.name
      fileExt = fileExt.substring(fileExt.lastIndexOf('.'))
      if (validExts.indexOf(fileExt) < 0) {
        $ctrl.fileExcel = null
        $scope.formProducts.excel.$error.invalidType = true
      } else {
        $scope.formProducts.excel.$error.invalidType = false
      }
    }

  }

  $scope.$watch('$ctrl.fileExcel', () => {
    $ctrl.showExcelUploaded = ($ctrl.fileExcel) ? $ctrl.imageExcelUploadedPath : $ctrl.imageExcelPath;
    $ctrl.errorMessage = ''
  });

	$ctrl.goToStoreCommerce = () => {
		$state.go('board.commerce.shop', {commerceId: $stateParams.commerceId})
	}

  $ctrl.saveProducts = () => {

    $.LoadingOverlay('show');
    const reader = new FileReader();


      reader.onload = function(e) {
        const wb = XLSX.read(e.target.result, {type: 'binary'});
        const services = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {raw: true, blankRows: false, defval: ''});
        $ctrl.errorMessage = ''

        const servicesResult = services.reduce((result, row) => {
          const ok = !!(row.nombre && row.precio && row.precio > 0 && row.categoria);
          (result[ok] = result[ok] || []).push(row)
          return result
        }, {})

        if (servicesResult.false !=  undefined){
          // mostrar las filas con problemas, se obtienen de servicesResult.false tiene cada una el rowNum .. no se si sera accesible.
          // Estaria bueno mostrar ""error en la file N" donde N es el rowNum
          //TODO podriamos poner en rojo las primeras 10 filas con errores por debajo del excel o del cargar productos ?
          let maxIterate = 0;
          $ctrl.errorMessage = 'Error en las filas: '
          maxIterate = (servicesResult.false.length > 3) ? maxIterate = 3 : servicesResult.false.length
          for(var i = 0; i < maxIterate -1 ; i++){
            $ctrl.errorMessage+= (servicesResult.false[i].__rowNum__+ 1 ) + ', '
          }
          $ctrl.errorMessage+= (servicesResult.false[servicesResult.false.length-1].__rowNum__ + 1 )+'.'
          $ctrl.showExcelUploaded = $ctrl.imageExcelPath;
          $scope.$apply()

          $.LoadingOverlay('hide')
          return
        }
        //la imagen no se envia más.
        productService.saveAllProductsWithoutImages($stateParams.commerceId, {services: servicesResult.true})
        .then(() => $state.go( "board.commerce.shop" ,{commerceId : $stateParams.commerceId }))
        .catch(err => errorService.handle(err))
        .finally(() => $.LoadingOverlay('hide'))

      }
      reader.onloadend = function(e){}

      reader.readAsBinaryString($ctrl.fileExcel)

  }

}
