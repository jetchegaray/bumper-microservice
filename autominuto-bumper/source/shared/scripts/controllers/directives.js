angular.module('amApp')
  .directive('starRating', function() {
    return {
      scope: {
        'value': '=value',
        'max': '=max',
        'hover': '=hover',
        'isReadonly': '=isReadonly'
      },
      restrict: 'EA',
      template:
            '<span ng-class="{isReadonly: isReadonly}">' +
            '<i ng-class="renderObj" ' +
            'ng-repeat="renderObj in renderAry" ' +
            'ng-click="setValue($index)" ' +
            'ng-mouseenter="changeValue($index, changeOnHover )" >' +
            '</i>' +
            '</span>',
      link: function(scope, element, attrs, ctrl) {

        if (scope.max === undefined || scope.max > 5 ) scope.max = 5;
        
        function renderValue() {
            scope.renderAry = [];
            for (var i = 0; i < scope.max; i++) {
                if (i < scope.value) {
                    scope.renderAry.push({
                        'fa fa-star': true
                    });
                } else {
                    scope.renderAry.push({
                        'fa fa-star-o': true
                    });
                }
            }
        }

        scope.setValue = function (index) {
            if (!scope.isReadonly && scope.isReadonly !== undefined) {
                scope.value = index + 1;
            }
        };

        scope.changeValue = function (index) {
            if (scope.hover) {
                scope.setValue(index);
            } else {
                // !scope.changeOnhover && scope.changeOnhover != undefined
            }
        };

        scope.$watch('value', function (newValue, oldValue) {
            if (newValue) {
                renderValue();
            }
        });
        scope.$watch('max', function (newValue, oldValue) {
            if (newValue) {
                renderValue();
            }
        });
      }
    }
  })
  .directive('starShowRating', function() {
    return {
      scope: {
        rating: '=',
      },
      restrict: 'EA',
      transclude: true,
      templateUrl: 'shared/views/tmpl-stars-icon.html',
    }
  })
