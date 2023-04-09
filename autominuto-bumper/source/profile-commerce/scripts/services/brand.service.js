'use strict'

angular.module('amApp').factory('commerceBrandService', commerceBrandService)

function commerceBrandService() {
  return {
    getCommerceType: getCommerceType,
    getCommerceColorType: getCommerceColorType,
  }

  function getCommerceType($commerce) {

    if ((!$commerce.sparePartsOfficialBrands && !$commerce.serviceOfficialBrands) ||
        ($commerce.sparePartsOfficialBrands.length == 0 && $commerce.serviceOfficialBrands.length == 0)) {
        return 'regular';
    }

    //Definir color de MIXTO si es oficial de ambos > E77B1E
    if ($commerce.sparePartsOfficialBrands.length > 0 && $commerce.serviceOfficialBrands.length > 0) {
        return 'mixto';
    }

    //Definir color de REPRESENTANTE OFICIAL de marca f. autoparte = ffb030
    if ($commerce.sparePartsOfficialBrands.length > 0) {
        return 'representante-oficial';
    }
    
    //Definir color de AGENTE OFICIAL de marca f. unidades > 5c9bbf
    if ($commerce.serviceOfficialBrands.length > 0) {
        return 'agente-oficial';
    }

  }
  function getCommerceColorType($commerce) {
      return 'color-' + this.getCommerceType($commerce);
  }
}