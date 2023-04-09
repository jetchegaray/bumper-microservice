angular.module('amApp').component('serviceTypeMultipleSelector', {
  templateUrl: 'shared/views/data-multiple-selector.html',
  controller: ServiceTypeMultipleSelectorController,
  bindings: {
    data: '<',
    selectedData: '=',
    placeholder: '@',
    searchAttribute: '@',
    onChange: '&',
    elementSelector: '<',
  }
})

function ServiceTypeMultipleSelectorController(serviceTypeService, handlerAutocompleteCategories) {
  const $ctrl = this
  $ctrl.rootImages = "assets/images/categories/"

  $ctrl.dataFiltered = []

  $ctrl.$onInit = () => {
    $ctrl.placeholder = $ctrl.placeholder || ' '
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
    })
  }

  $ctrl.onSelect = (item) => {
    if (typeof $ctrl.onChange === 'function') {
      $ctrl.onChange({item})
      let element = document.querySelectorAll('#' + $ctrl.elementSelector + " .ui-select-search")
      if (element.length > 0) {
        element[0].focus()
      }
    }
  }

}
