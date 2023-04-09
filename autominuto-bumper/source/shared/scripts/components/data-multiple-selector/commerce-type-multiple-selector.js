'use strict'

angular.module('amApp').component('commerceTypeMultipleSelector', {
  templateUrl: 'shared/views/data-multiple-selector.html',
  controller: CommerceTypeMultipleSelectorController,
  bindings: {
    data: '<',
    selectedData: '=',
    placeholder: '@',
    onChange: '&',
    searchAttribute: '@',
    elementSelector: '<',
  }
})

function CommerceTypeMultipleSelectorController(commerceTypeService, handlerAutocompleteCategories) {
  const $ctrl = this

  $ctrl.dataFiltered = []
  $ctrl.rootImages = "assets/images/categories/"
  
  $ctrl.$onInit = () => {
    $ctrl.placeholder = $ctrl.placeholder || ' '
    $ctrl.searchAttribute = $ctrl.searchAttribute || 'name'
    if (!$ctrl.data) {
      $.LoadingOverlay('show');
      commerceTypeService.getAll()
        .then(types => $ctrl.data = types)
        .catch(err => console.log(err))
        .finally(() => $.LoadingOverlay('hide', true))
    }
  }

  $ctrl.filterData = (query) => {
    $ctrl.dataFiltered = $ctrl.data && $ctrl.data.filter(commerceType => {

      let aliasNotAccent = handlerAutocompleteCategories.accentFold(commerceType[$ctrl.searchAttribute].toLowerCase())
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
