'use strict'

angular.module('amApp').component('serviceTypeUniqueSelector', {
  templateUrl: 'shared/views/data-unique-selector.html',
  controller: ServiceTypeUniqueSelectorController,
  bindings: {
    data: '<',
    selectedData: '=',
    placeholder: '@',
    disabled: '<',
    searchAttribute: '@',
    allowClear: '<',
    onChange: '&',
    fixed: '<',
    required: '@'
  }
})

function ServiceTypeUniqueSelectorController(serviceTypeService, handlerAutocompleteCategories) {
  const $ctrl = this

  $ctrl.dataFiltered = []

  $ctrl.$onInit = () => {
    $ctrl.placeholder = $ctrl.placeholder || ' '
    $ctrl.disabled = $ctrl.disabled || false
    $ctrl.searchAttribute = $ctrl.searchAttribute || 'name'

    if (!$ctrl.data) {
      $.LoadingOverlay('show');
      serviceTypeService.getAll()
        .then(types => $ctrl.data = types)
        .catch(err => console.log(err))
        .finally(() => $.LoadingOverlay('hide', true))
    }
  }

  $ctrl.filterData = (query) => {
    $ctrl.dataFiltered = $ctrl.data && $ctrl.data.filter(serviceType => {

      let aliasNotAccent = handlerAutocompleteCategories.accentFold(serviceType[$ctrl.searchAttribute].toLowerCase())
      let queryNotAccent = handlerAutocompleteCategories.accentFold(query.toLowerCase())

      let words = query.split(" ")
      let regexMetachars = /[.*+?^${}()|[\]\\]/g;

      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
      }
      var regex = new RegExp(words.join(".*"), "gi");

      return aliasNotAccent.match(regex) != null
//      return aliasNotAccent.indexOf(queryNotAccent) !== -1
    })
  }

  $ctrl.onSelect = (serviceType) =>{
    if (typeof $ctrl.onChange === 'function') {
      $('.button-clear').hide()
      $ctrl.onChange({serviceType})
    }
  }

  $ctrl.onClick = () =>{
    $('.button-clear').show()
  }
}
