angular.module('amApp').component('issueUniqueSelector', {
  templateUrl: 'shared/views/issue-unique-selector.html',
  controller: IssueUniqueSelectorController,
  bindings: {
    issues: '<',
    selectedIssue: '=',
    onSelect: '&',
    isDisabled: '<'
  }
})

function IssueUniqueSelectorController(handlerAutocompleteCategories) {
  const $ctrl = this
  $ctrl.issuesFiltered = []
  $ctrl.filterIssues = query => {
    $ctrl.issuesFiltered = $ctrl.issues.filter(issue => {
      const issueNotAccent = handlerAutocompleteCategories.accentFold(issue.toLowerCase())
      const queryNotAccent = handlerAutocompleteCategories.accentFold(query.toLowerCase())

      let words = query.split(" ")
      let regexMetachars = /[.*+?^${}()|[\]\\]/g;

      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
      }
      var regex = new RegExp(words.join(".*"), "gi");

      return issueNotAccent.match(regex) != null

      //return issueNotAccent.indexOf(queryNotAccent) !== -1
    })
    //$ctrl.issuesFiltered.unshift(query)
  }

  $ctrl.onChange = issue => {
    if (typeof $ctrl.onChange === 'function') {
      $ctrl.onSelect({issue})
    }
  }

}
