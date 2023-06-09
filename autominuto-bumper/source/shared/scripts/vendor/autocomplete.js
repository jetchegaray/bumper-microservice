/**
 * Angular js autocomplete directive
 * author: swavs
 * git repository : https://github.com/swavs/angular-autocomplete.git
 */
(function() {
  'use strict';
  angular.module('AutoCompleteModule', [])
          .directive('swavsAutoComplete', ['$q', '$http', '$sce', '$timeout',
                      function($q, $http, $sce, $timeout) {
                        // standard keys code
                        var KEY_DW = 40;
                        var KEY_UP = 38;
                        var KEY_ES = 27;
                        var KEY_EN = 13;
                        var KEY_TAB = 9;

                        return {
                          restrict: 'EA',
                          require: '^?form',
                          scope: {
                            selectedResult: '=',
                            initialValue: '=',
                            resultsFormatter: '=',
                            source: '=',
                            placeholder: '@',
                            minlength: '@',
                            selectHandler: '=',
                            overrideSearch: '=',
                            limitResult: '=',
                            elementSelector: '@',
                            showArrow: '@',
                            required: '@',
                            name: '@',
                            readonly: '@'
                          },
                          template: '<div class="autocomplete-content" style="position: relative">'
                                  + '  <input id="{{elementSelector}}" name="{{name}}" ng-model="inputString" type="text" placeholder="{{placeholder}}" ng-focus="initDefaultResults()" ng-change="inputChangeHandler($event)" class="autocomplete-text form-control" ng-class="{\'remove-gray\': readonly}" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-required="required ? true : false" ng-readonly="readonly ? true : false" />'
                                  + '  <span class="glyphicon glyphicon-chevron-down" style="position:absolute;top:10px;right:10px; cursor:pointer; display:none" ng-click="initDefaultResults()" ng-class="{\'display-block\' : showArrow}"></span>'
                                  + '  <div class="autocomplete-dropdown" ng-show="showDropdown">'
                                  + '    <div class="autocomplete-search-text col-md-12" ng-show="searching" ng-bind="labelSearching"></div>'
                                  + '    <div class="autocomplete-search-text col-md-12" ng-show="noResults" ng-bind="labelNoResults"></div>'
                                  + '    <ul class="autocomplete-list"><li class="autocomplete-row col-md-12" ng-repeat="result in results" ng-click="selectResult(result, $event)" ng-mouseenter="hoverRow($index)" ng-mouseleave="hoverOut($index)" ng-class="{\'autocomplete-highlight-row\': $index == currentIndex}">'
                                  + '      <span class="autocomplete-title" ng-bind-html="result.label"></span>'
                                  + '    </li></ul>' + '</div>' + '</div>',
                          link: function(scope, elem, attrs, ctrl) {
                            var inputField = elem.find('input');
                            var httpCancel= null;
                            var suggestionsList = elem[0].querySelector('.autocomplete-dropdown');
                            scope.currentIndex = -1;
                            scope.searching = false;
                            scope.noResults = false;
                            scope.resultSelect = false;
                            scope.labelSearching = 'Buscando...';
                            scope.labelNoResults = 'No se encontrarón resultados';
                            scope.searchInput = "";
                            if (scope.minlength && scope.minlength !== '') {
                              scope.minlength = parseInt(scope.minlength, 10);
                            }else{
                              scope.minlength = 1;
                            }
                            if (scope.initialValue) {
                              scope.inputString = scope.initialValue;
                              scope.searchInput = scope.inputString;
                            }
                            //this watch before was inside the conditional for initialValue
                            //now when you pass initialValue the string label for input change
                            scope.$watch('initialValue', function(newval,
                                    oldval) {
                              if (newval && newval.length > 0) {
                                scope.inputString = scope.initialValue;
                              }
                            });

                            //scroll to the top of list when end of list is reached
                            function scrollToTop(){
                              if (isScrollNeeded()) {
                                var row = elem[0].querySelectorAll('.autocomplete-row')[0];
                                suggestionsList.scrollTop = -1 * row.offsetHeight;
                              }
                            }

                            function scrollToBottom() {
                              if (isScrollNeeded()) {
                                var row = elem[0]
                                        .querySelectorAll('.autocomplete-row')[scope.results.length - 1];
                                suggestionsList.scrollTop = row.getBoundingClientRect().top;
                              }
                            }

                            function isScrollNeeded(){
                              var ddCSS = getComputedStyle(suggestionsList);
                              return (suggestionsList.scrollHeight > suggestionsList.clientHeight)
                                      && (ddCSS.overflowY === 'auto'
                                              || ddCSS.overflowY === 'visible' || ddCSS.overflowY === 'scroll');
                            }

                            function adjustddHeight() {
                              if (isScrollNeeded()) {
                                var ddCSS = getComputedStyle(suggestionsList);
                                var borderTop, paddingTop, offset, scroll, ddHeight, rowHeight;
                                var row = elem[0]
                                .querySelectorAll('.autocomplete-row')[scope.currentIndex];
                                borderTop = parseInt(ddCSS.borderTopWidth, 10) || 0;
                                paddingTop = parseInt(ddCSS.paddingTop, 10) || 0;
                                offset = row.getBoundingClientRect().top - suggestionsList.getBoundingClientRect().top - borderTop - paddingTop;
                                scroll = suggestionsList.scrollTop;
                                ddHeight = suggestionsList.offsetHeight;
                                rowHeight = row.offsetHeight;
                                if ( offset < 0 ) {
                                  suggestionsList.scrollTop = ( scroll + offset );
                                } else if ( offset + rowHeight > ddHeight ) {
                                  suggestionsList.scrollTop = ( scroll + offset - ddHeight + rowHeight );
                                }
                              }
                            }
                            function keydownHandler(event) {
                              var keyCode = event.which ? event.which
                                      : event.keyCode;
                              scope.inputString = inputField.val();
                              if (keyCode === KEY_EN && scope.results) {
                                if (scope.currentIndex >= 0
                                        && scope.currentIndex < scope.results.length) {
                                  event.preventDefault();
                                  scope.selectResult(scope.results[scope.currentIndex]);
                                } else {
                                  clearResults();
                                }
                                scope.$apply();
                              } else if (keyCode === KEY_DW && scope.results) {
                                event.preventDefault();
                                if ((scope.currentIndex + 1) < scope.results.length
                                        && scope.showDropdown) {
                                  scope.currentIndex++;
                                  scope.inputString = scope.results[scope.currentIndex].title;
                                  adjustddHeight();
                                } else if (scope.currentIndex + 1 === scope.results.length) {
                                  scope.currentIndex = -1;
                                  scope.inputString = scope.searchInput;
                                  scrollToTop();
                                }
                                scope.$apply();
                              } else if (keyCode === KEY_UP && scope.results) {
                                event.preventDefault();
                                if (scope.currentIndex >= 1) {
                                  scope.currentIndex--;
                                  scope.inputString = scope.results[scope.currentIndex].title;
                                  adjustddHeight();
                                } else if (scope.currentIndex === 0) {
                                  scope.currentIndex = -1;
                                  scope.inputString = scope.searchInput;
                                } else if (scope.currentIndex === -1) {
                                  scope.currentIndex = scope.results.length - 1;
                                  scope.inputString = scope.results[scope.currentIndex].title;
                                  scrollToBottom();
                                }
                                scope.$apply();
                              } else if (keyCode === KEY_TAB) {
                                if (scope.results && scope.results.length > 0
                                        && scope.showDropdown) {
                                  if (scope.currentIndex > -1
                                          && scope.currentIndex < scope.results.length) {
                                    scope.selectResult(scope.results[scope.currentIndex]);
                                  } else {
                                    clearResults();
                                  }
                                }
                                //call digest to move focus to the next focusable element(default TAB behaviour)
                                scope.$digest();
                              } else if (keyCode === KEY_ES) {
                                event.preventDefault();
                                clearResults();
                                scope.inputString = scope.searchInput;
                                scope.$apply();
                              }
                            }

                            function clearResults() {
                              scope.showDropdown = false;
                              scope.results = [];
                              if (suggestionsList) {
                                suggestionsList.scrollTop = 0;
                              }
                            }

                            function initResults() {
                              scope.showDropdown = true;
                              scope.currentIndex = -1;
                              scope.results = [];
                            }

                            function accentHelper(value) {

                              let accentMap = {
                              'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u'
                              };

                              if (!value) { return ''; }
                              let ret = ''
                              for (let i = 0; i < value.length; i++) {
                                ret += accentMap[value.charAt(i)] || value.charAt(i);
                              }
                              return ret
                            }

                            function getLocalResults(str) {
                              var i;
                              var matches = [];
                              var max = getLimit();

                              str = accentHelper(str)

                              for (i = 0; i < scope.source.length; i++) {
                                var match = false;
                                if(scope.overrideSearch && typeof scope.overrideSearch == 'function'){
                                  match = scope.overrideSearch(str, scope.source[i]);
                                }else{
                                  var matcher = new RegExp(str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ), "i" );
                                  match = matcher.test( accentHelper(scope.source[i].label) || accentHelper(scope.source[i]) );
                                }

                                if (match) {
                                  matches[matches.length] = scope.source[i];

                                  if(max > -1 && matches.length >= max) {
                                    break;
                                  }
                                }
                              }
                              scope.searching = false;
                              processResults(matches, str);
                            }

                            // funcion agregada para limitar la cantidad de resultados
                            function getLimit() {
                              return (scope.limitResult)? scope.limitResult: -1;
                            }

                            function getSearchResults(str) {
                              scope.resultSelect = false;
                              // Begin the search
                              if (!str || str.length < scope.minlength) { return; }
                              if (scope.source) {
                                scope.searching = true;
                                scope.noResults = false;
                                if (typeof scope.source == 'function') {
                                  var config = scope.source(str);
                                  if (httpCancel) {
                                    httpCancel.resolve();
                                  }
                                  httpCancel = $q.defer();
                                  config.timeout = httpCancel.promise;
                                  $http(config).
                                  then(function(response) {
                                                    var results = [];
                                                    if (scope.resultsFormatter
                                                            && typeof scope.resultsFormatter == 'function') {
                                                      results = scope
                                                              .resultsFormatter(
                                                                      str,
                                                                      response);
                                                    } else {
                                                      results = response.data;
                                                    }
                                                    scope.searching = false;
                                                    processResults(results, str);
                                                  },
                                                  function(response) {
                                                    if (console
                                                            && console.error) {
                                                      console.error('call to get remote data failed with error'
                                                                      + response.status);
                                                    }
                                                  });
                                } else {
                                  getLocalResults(str);
                                }
                              }
                            }

                            function processResults(responseData, str) {
                              var i, text, highlightText, value;

                              if (responseData && responseData.length > 0) {
                                scope.results = [];

                                for (i = 0; i < responseData.length; i++) {
                                  text = highlightText = responseData[i].label || responseData[i];
                                  //highlight the text that match the input text
                                  highlightText = highlightMatches(text, str);
                                  if (responseData[i].value != null) {
                                    value = responseData[i].value;
                                  } else {
                                    value = text;
                                  }
                                  scope.results[scope.results.length] = {
                                    title: text,
                                    label: highlightText,
                                    value: value
                                  };
                                }

                              } else {
                                scope.noResults = true;
                                scope.results = [];
                              }
                            }

                            function highlightMatches(dataStr, str) {
                              var result;
                              str = accentHelper(str)
                              var dataStrCopy = accentHelper(dataStr)

                              var matcher = new RegExp(str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ), "i" );
                              var match = dataStrCopy.match(matcher);

                              if (match) {
                                result = dataStr.replace(matcher,
                                        '<span class="matched-text">'
                                                + match[0] + '</span>');
                              } else {
                                result = dataStr;
                              }
                              return $sce.trustAsHtml(result);
                            }

                            //call search if input is changed
                            scope.inputChangeHandler = function() {
                              scope.searchInput = scope.inputString;
                              if (!scope.inputString || scope.inputString === '') {
                                scope.showDropdown = false;
                                // initDefaultResults();
                              } else if (scope.inputString.length >= scope.minlength) {
                                initResults();
                                getSearchResults(scope.inputString);
                              }
                            };

                            scope.initDefaultResults = function() {
                              if (!scope.source || (scope.initialValue && scope.initialValue.length)) return

                              let elementId = document.getElementById(scope.elementSelector)
                              elementId && elementId.select()

                              scope.showDropdown = true;
                              scope.currentIndex = 0;
                              scope.results = []

                              for (let index = 0; index < scope.source.length; index++) {
                                scope.results.push({
                                  label: scope.source[index].label || scope.source[index].name,
                                  value: scope.source[index].value || scope.source[index].id
                                })

                              }
                              processResults(scope.results, '');
                            }

                            //event handler for blur, will set scope.selectedResult with the value of input field, if not
                            //selected from suggestions
                            scope.hideResults = function(event) {
                              event.preventDefault();
                              if (httpCancel) {
                                httpCancel.resolve();
                              }
                              $timeout( function() {
                                //scope.resultSelect will be false if nothing is selected from autocomplete list
                                        if (scope.resultSelect === false) {
                                          scope.inputString = scope.searchInput;
                                          clearResults();
                                          scope.$apply(function() {
                                                    if (scope.inputString
                                                            && scope.inputString.length > 0) {
                                                      inputField.val(scope.inputString);
                                                    }
                                                  });
                                          var result = {
                                            label: scope.inputString,
                                            value: null,
                                            isSelectedFromMenu: false
                                          };
                                          scope.selectedResult = result;
                                          if (scope.selectHandler
                                                  && typeof scope.selectHandler === 'function') {
                                            scope.selectHandler(false);
                                          }
                                        }
                                      }, 200);
                            };

                            scope.hoverRow = function(index) {
                              scope.currentIndex = index;
                              if (scope.results) {
                                scope.currentResult = scope.results[scope.currentIndex];
                              }
                            };
                            scope.hoverOut = function(index) {
                              scope.currentResult = null;
                              scope.currentIndex = -1;
                            }
                            //on click handler on each <li> item of autocomplete list
                            scope.selectResult = function(result, event) {
                              scope.inputString = result.title.replace(/&nbsp;/g, "").replace(/<(|\/)b>/g, "");
                              scope.searchInput = scope.inputString;
                              scope.resultSelect = true;
                              var resultSelected = {
                                label: result.title,
                                value: result.value,
                                isSelectedFromMenu: true
                              };
                              scope.selectedResult = resultSelected;
                              $timeout( function() {
                                if (scope.selectHandler
                                        && typeof scope.selectHandler === 'function') {
                                  scope.selectHandler(true);
                                }
                                      }, 200);
                              clearResults();
                            };
                            inputField.on('keydown', keydownHandler);
                          }
                        };
                      }]);
})();
