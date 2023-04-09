'use strict'

angular.module('amApp').component('carItem', {
  templateUrl: 'steps/views/car-item.html',
  controller: CarItemController,
  bindings: {
    car: '<',
    brands: '<',
    insuranceCompanies: '<',
    userCars: '<',
    parentForm: '<',
    onRemove: '&',
    onSelectUserCar: '&',
    onSelectCarBrand: '&',
    onSelectCarSubBrand: '&',
    onSelectCarInsurance: '&',
    onIsProductCategory: '&',
    onShowChasis: '&',
    saveSelection: '&',
    brandSelected: '='
  }
})

function CarItemController($rootScope, $timeout, _) {

  const $ctrl = this

  $ctrl.focusOnSubbrandEventName = 'EventCarItemSelectorSubbrandFocus';

  // $ctrl.$scope.$on($ctrl.focusOnEventName, () => {
  //   console.log()
  // });

  $ctrl.maxYear = new Date().getFullYear()

  $ctrl.remove = () => { $ctrl.onRemove({car: $ctrl.car}) }

  $ctrl.selectUserCar = (selectedUserCar) => { $ctrl.onSelectUserCar({car: $ctrl.car, selectedUserCar: selectedUserCar}) }

  // $ctrl.selectUserCar = (selectedUserCar) => { $ctrl.onSelectUserCar({car: $ctrl.car, selectedUserCar: selectedUserCar}) }
  $ctrl.saveBrandSelection = (selected) => {
    if (!selected) {
      return
    }
    delete $ctrl.car.subBrand
    $rootScope.$broadcast($ctrl.focusOnSubbrandEventName, {});
    $ctrl.onSelectCarBrand({car: $ctrl.car, brandName: $ctrl.car.brand.name })
  }

  $ctrl.saveSubBrandSelection = (selected) => {
    if (!selected) {
      return
    }
    $ctrl.onSelectCarSubBrand({car: $ctrl.car, subBrandName: $ctrl.car.subBrand.label})
    $timeout(() => $('#year').focus(), 0);
  }

  $ctrl.saveInsuranceSelection = (selected) => {
    if (!selected) {
      return
    }
    $ctrl.onSelectCarInsurance({car: $ctrl.car, insuranceName: $ctrl.car.insurance.name })
    $timeout(() => $('#vin input').focus(), 0);
  }

  $ctrl.isProductCategory = () => { return $ctrl.onIsProductCategory() }

  $ctrl.showChasis = () => { return $ctrl.onShowChasis() }

  $ctrl.$onChanges = (objs) => {
    // Select by default the brand selected in the homepage
    if ($ctrl.brandSelected && objs.brands && objs.brands.currentValue.length) {
        let selectedBrands = _.filter(objs.brands.currentValue, function(brand){return brand.name.toUpperCase() == $ctrl.brandSelected.toUpperCase()})
        $ctrl.car.brand = selectedBrands[0] //return the first match
    }
  }
}
