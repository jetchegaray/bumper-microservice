'use strict'

angular.module('amApp').component('insuranceCompanyMultipleSelector', {
  templateUrl: 'shared/views/data-multiple-selector.html',
  controller: InsuranceCompanyMultipleSelector,
  bindings: {
    data: '<',
    selectedData: '=',
    placeholder: '@',
    onChange: '&',
    searchAttribute: '@',
    elementSelector: '<',
  }
})

function InsuranceCompanyMultipleSelector(userService, handlerAutocompleteCategories) {
  const $ctrl = this

  $ctrl.dataFiltered = []
  $ctrl.rootImages = "assets/images/insurances-companies/"

  $ctrl.$onInit = () => {
    $ctrl.placeholder = $ctrl.placeholder || ' '
    $ctrl.searchAttribute = $ctrl.searchAttribute || 'name'
    if (!$ctrl.data) {
      $.LoadingOverlay('show');
      userService.getAllInsurancesCompanies()
        .then(companies => $ctrl.data = companies)
        .catch(err => console.log(err))
        .finally(() => $.LoadingOverlay('hide', true))
    }
  }

  $ctrl.filterData = (query) => {
    $ctrl.dataFiltered = $ctrl.data && $ctrl.data.filter(insuranceCompany => {

      let aliasNotAccent = handlerAutocompleteCategories.accentFold(insuranceCompany[$ctrl.searchAttribute].toLowerCase())
      let queryNotAccent = handlerAutocompleteCategories.accentFold(query.toLowerCase())

      let words = query.split(" ")
      let regexMetachars = /[.*+?^${}()|[\]\\]/g;

      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
      }
      var regex = new RegExp(words.join(".*"), "gi");

      return aliasNotAccent.match(regex) != null
    })
  }

  $ctrl.onSelect = (data) => {
    if (typeof $ctrl.onChange === 'function') {
      $ctrl.onChange({data})
      let element = document.querySelectorAll('#' + $ctrl.elementSelector + " .ui-select-search")
      if (element.length > 0) {
        element[0].focus()
      }
    }
  }

}
