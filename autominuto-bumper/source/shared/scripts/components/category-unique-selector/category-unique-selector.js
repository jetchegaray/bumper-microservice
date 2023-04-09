angular.module('amApp').component('categoryUniqueSelector', {
  templateUrl: 'shared/views/category-unique-selector.html',
  controller: CategoryUniqueSelectorController,
  bindings: {
    categories: '<',
    selectedCategory: '=',
    placeholder: '@',
    disabled: '<',
    searchAttribute: '@',
    allowClear: '<',
    onChange: '&',
    fixed: '<'
  }
})

function CategoryUniqueSelectorController(handlerAutocompleteCategories) {
  const $ctrl = this

  $ctrl.categoriesFiltered = []

  $ctrl.$onInit = () => {
    $ctrl.placeholder = $ctrl.placeholder || ' '
    $ctrl.disabled = $ctrl.disabled || false
    $ctrl.searchAttribute = $ctrl.searchAttribute || 'alias'
   
  }

  $ctrl.filterCategories = (query) => {
    $ctrl.categoriesFiltered = $ctrl.categories && $ctrl.categories.filter(category => {
      let aliasNotAccent = handlerAutocompleteCategories.accentFold(category[$ctrl.searchAttribute].toLowerCase())
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

  $ctrl.onSelect = (category) =>{
    if (typeof $ctrl.onChange === 'function') {
      $('.button-clear').hide()
      $ctrl.onChange({category})
    }
  }

  $ctrl.onClick = () =>{
    $('.button-clear').show()
  }
}
