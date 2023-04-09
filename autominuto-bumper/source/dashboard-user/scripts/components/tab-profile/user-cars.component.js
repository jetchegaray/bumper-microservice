'use strict'

angular.module('amApp').component('userCar', {
  templateUrl: 'dashboard-user/views/tab-profile/user-cars-view.html',
  controller: UserCarComponentController,
  bindings: {
    userCars: "=",
    refreshCallback: '&'
  }
})

function UserCarComponentController(userService, localStorageService, $scope, ModalService, errorService, $state) {
	var $ctrl = this;

	$ctrl.radioCars
	$ctrl.cars = [];
	$ctrl.showModalVehiculos = (carParam)=>{
		ModalService.showModal({
			templateUrl: "dashboard-user/views/tab-profile/modals-view/tmpl-cars-popup.html",
			backdrop: 'static',
			keyboard: false,
			controller: "CarUserAmModalController",
			size: 'lg',
			windowClass: 'my-modal',
			inputs: {
				rawCar: carParam
			},
			preClose: function(modal) {
				modal.element.modal('hide');
			}
		}).then(function (modal) {
			modal.element.modal();
			modal.close.then( (car)=>{
				const userId = localStorageService.get('userId');
				if(car){
				  if(car.id){
				    userService.updateCar(car).then( ()=> { $ctrl.refreshCallback() },(error)=> {
				      errorService.handle(error)
				    });
				  } else{
				    userService.addCar(userId, car).then( ()=> { $ctrl.refreshCallback() },(error)=> {
				      errorService.handle(error)
				    });
				  }
				  
				}
			})
		});
	}

	$ctrl.deleteCar = (carParam) => {
		ModalService.showModal({
			templateUrl: "shared/views/tmpl-popup-confirm.html",
			inputs: {
				textDeleteModal:  carParam.brand.name        + ' - ' +
				                  carParam.brand.subbrands[0].name  + ' - ' +
				                  carParam.chasisNumber,
				deleteElement: carParam
			},
			controller: 'DeleteCarAmModalController',

			preClose: function preClose(modal) {
				modal.element.modal('hide')
			}
		}).then(function (modal) {
			modal.element.modal();
			modal.close.then((car) => {
			if(car){
				  userService.deleteCar(car.id).then( ()=> { $ctrl.refreshCallback() },function(error) {
				    errorService.handle(error)
				  });
			}
			});
		});
	}


	$ctrl.goTofastCarsLoad = () => {
		$state.go("board.user.cars_fastload")
	}


}