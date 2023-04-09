angular.module('amApp').component('singleBrandSelector', {
  templateUrl: 'shared/views/single-brand-selector.html',
  controller: SingleBrandSelectorController,
  bindings: {
    brands: '=',
    selectedBrand: '=',
    multiple: '<',
    placeholder: '@',
    searchAttribute: '@',
    allowClear: '<',
    onChange: '&'
  }
})

function SingleBrandSelectorController() {
  const $ctrl = this

  $ctrl.filteredBrands = []

  $ctrl.$onInit = () => {
    $ctrl.searchAttribute = 'name'
    $ctrl.filteredBrands = $ctrl.brands
  }

  $ctrl.filterBrands = (query) => {
    $ctrl.filteredBrands = $ctrl.brands.filter(brand => {
      let alias = brand[$ctrl.searchAttribute].toLowerCase()

      let words = query.split(" ")
      let regexMetachars = /[.*+?^${}()|[\]\\]/g;

      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
      }
      var regex = new RegExp(words.join(".*"), "gi");

      return alias.match(regex) != null
    })
  }

  $ctrl.onSelect = (brand) => {
    if (typeof $ctrl.onChange === 'function') {
      $ctrl.onChange({brand})
    //   $ctrl.selectedBrand.push(brand)
    }
  }
}
