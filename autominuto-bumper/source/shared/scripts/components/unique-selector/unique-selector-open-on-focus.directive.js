'use strict'

angular.module('amApp').directive('uniqueSelectorOpenOnFocus', function($timeout){
  return {
    require: 'uiSelect',
    restrict: 'A',
    replace: true,
    link: function($scope, el, attrs, uiSelect) {
      var closing = false;

      angular.element(uiSelect.focusser)
        .on('focus', () => {
        if(!closing) {
          uiSelect.activate();
        }
      });

      // Because ui-select immediately focuses the focusser after closing
      // we need to not re-activate after closing
      $scope.$on('uis:close', function() {
        closing = true;
        $timeout(function() { // I'm so sorry
          closing = false;
        });
      });
    }
  };
});
