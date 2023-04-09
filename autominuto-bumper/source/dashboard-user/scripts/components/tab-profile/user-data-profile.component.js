'use strict'

angular.module('amApp').component('myDataProfile', {
  templateUrl: 'dashboard-user/views/tab-profile/user-data-profile.html',
  controller: TabUserDataProfileController,
  bindings: {
    userData: '=',
    refreshCallback: '&',
    showModalUserProfileCallback: '&'
  }
})


function TabUserDataProfileController() {
	
	var $ctrl = this;

}