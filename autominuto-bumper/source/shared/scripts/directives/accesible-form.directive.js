'use strict'

angular
  .module('amApp')
  .directive('accessibleForm', function() {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        // Set up event handler on the form element
        elem.on('submit', function() {
          // Find the first invalid element
          var firstInvalid = elem[0].querySelector('.has-error')
          // If we find one, set focus
          if (firstInvalid) {
            $('html, body').animate({
              scrollTop: ($('.has-error').first().offset().top - 80)
            }, 700)
            firstInvalid.focus()
          }
        })
      }
    }
  })