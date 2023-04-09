'use strict'

angular
  .module('amApp')
  .directive('imageMap', function() {
    return function(scope, element, attrs) {
      attrs.$observe('imageMap', function() {
        let url = attrs.imageMap
        element.css({
          'background-image': 'url(' + url + ')',
        })
      })
    }
  })
  .directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
  });