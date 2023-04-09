angular.module('amApp').component('multipleBrandSelector', {
  templateUrl: 'shared/views/multiple-brand-selector.html',
  controller: MultipleBrandSelectorController,
  bindings: {
    brands: '=',
    selectedBrand: '=',
    multiple: '<',
    placeholder: '@',
    searchAttribute: '@',
    allowClear: '<',
    onChange: '&',
    elementSelector: '<',
    disable: '<'
  }
})

function MultipleBrandSelectorController() {
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
      let element = document.querySelectorAll('#' + $ctrl.elementSelector + " .ui-select-search")
      if (element.length > 0) {
        element[0].focus()
      }
    }
  }

}
