'use strict'

angular.module('amApp').component('uniqueSelector', {
  templateUrl: 'shared/views/unique-selector.html',
  controller: UniqueSelectorController,
  bindings: {
    selectedData: '=',
    data: '<',
    placeholder: '@',
    disabled: '<',
    searchAttribute: '@',
    allowClear: '<',
    onChange: '&',
    fixed: '<',
    required: '@',
    focusOn: '<',
  }
})

function UniqueSelectorController($rootScope, handlerAutocompleteCategories) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    $ctrl.fixed = true;
    $ctrl.placeholder = $ctrl.placeholder || ' '
    $ctrl.disabled = $ctrl.disabled || false
    $ctrl.searchAttribute = $ctrl.searchAttribute || 'name';
  }

  $ctrl.filterData = (query) => {
    $ctrl.dataFiltered = $ctrl.data && $ctrl.data.filter(data => {
      let aliasNotAccent = handlerAutocompleteCategories.accentFold(data[$ctrl.searchAttribute].toLowerCase())
      let words = query.split(" ")
      let regexMetachars = /[.*+?^${}()|[\]\\]/g;
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
      }
      const regex = new RegExp(words.join(".*"), "gi");
      return aliasNotAccent.match(regex) != null
    });
  };

  $ctrl.onSelect = (selected) => {
    if (typeof $ctrl.onChange === 'function') {
      $ctrl.onChange({ selected });
    }
  }

  $ctrl.onOpenClose = (isOpen) => {
    $('.button-clear').toggle(isOpen);
  }

}
