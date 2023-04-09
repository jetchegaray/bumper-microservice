'use strict'

angular
  .module('amApp')
  .directive("tooltipTemplate", function($compile){
    return {
      restrict: "A",
      scope: {
        tooltipScope: "="
      },
      link: function(scope, element, attrs){
        let templateUrl = attrs.tooltipTemplate;

        scope.hidden = true;

        let tooltipElement = angular.element("<div ng-hide='hidden'>");
        tooltipElement.append("<div ng-include='\"" + templateUrl + "\"'></div>");

        element.parent().append(tooltipElement);
        element
          .on('mouseenter', function(){scope.hidden = false; scope.$digest();})
          .on('mouseleave', function(){scope.hidden = true; scope.$digest();});

        let toolTipScope = scope.$new(true);
        angular.extend(toolTipScope, scope.tooltipScope);
        $compile(tooltipElement.contents())(toolTipScope);
        $compile(tooltipElement)(scope);
      }
    };

  });
