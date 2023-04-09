'use strict'

angular.module('amApp').component('tabContainer', {
  controller: TabContainerController,
  templateUrl: "dashboard-commerce/views/container-tabs.html",
  transclude: true,
  bindings: {
    commerceProfile: '<',
    likeCommerce: '<',
    isFavorite: '<'
  }
});

function TabContainerController($stateParams, $auth) {
  var $ctrl = this
  $ctrl.tabs = []

  $ctrl.select = function(tab) {
    angular.forEach($ctrl.tabs, function(tab) {
      tab.selected = false
    })
    tab.selected = true
  }

  $ctrl.addTab = function(tab) {
    $ctrl.tabs.push(tab)

    if($stateParams.activeTab) {
      if(tab.state === $stateParams.activeTab) { $ctrl.select(tab) }
    } else {
      if($ctrl.tabs.length === 1) { $ctrl.select(tab) }
    }
  }

  $ctrl.isLogged = () => {
    return $auth.isAuthenticated()
  }

}
