angular.module('amApp')
.controller('UserDataModalController', ['$scope', 'close', 'userData', function($scope, close, userData) {

	var $ctrl = this

	$ctrl.init = () => {
		$ctrl.imagePath = 'assets/images/icons/image-upload.png'
		$ctrl.userData = angular.copy(userData)
		$ctrl.phoneData = $ctrl.userData.phone
		$ctrl.perfilImage = $ctrl.userData.imageUrl
	}

	$ctrl.close = function(result) {
		close(result, 500); // close, but give 500ms for bootstrap to animate
	};

	$ctrl.updateUserData = (result) => {
		if($scope.userDataForm.$valid){

			$ctrl.userData.name ? $ctrl.userData.name : $ctrl.userData.name = null
			$ctrl.phoneData.countryCodeNumber = "+54"
			$ctrl.userData.phone = $ctrl.phoneData

			result = {
				userData : $ctrl.userData,
				perfilImage : $ctrl.perfilImage
			}
			close(result, 500);
		}
	}

	// function fillPhones(phone) {        
	//     return phoneService.getPhone(phone)
	//   }

	// function formatPhone(){
	// 	return phoneService.savePhone($ctrl.phoneData)
	// }

	$ctrl.init();

}]);