'use strict'

angular.module('amApp').component('tab', {
  controller: TabController,
  transclude: true,
  require: {
    tabContainer: '^tabContainer'
  },
  bindings: {
    titleTab: '@',
    state: '@',
    titleIcon: '@'
  },
  templateUrl: 'dashboard-commerce/views/tab.html',
})

function TabController() {
  var $ctrl = this;

  $ctrl.$onInit = function() {
    $ctrl.tabContainer.addTab(this);
  }

}
