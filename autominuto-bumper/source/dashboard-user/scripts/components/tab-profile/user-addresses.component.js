'use strict'

angular.module('amApp').component('userAddresses', {
  templateUrl: 'dashboard-user/views/tab-profile/user-addresses-view.html',
  controller: UserAddressesController,
  bindings: {
    userAdresses: "<",
    refreshCallback: '&'
  }
})


function UserAddressesController(userService, localStorageService, $scope, ModalService, errorService) {
  
  var $ctrl = this

  $ctrl.radioAddresses

  $ctrl.address
  $ctrl.userAddresses = []
  
  $ctrl.marker
  $ctrl.types = "['address']"
  $ctrl.flags = {
    'loadingLocation': false,
    'locationError': false,
    'addressDirty': false,
  }

  $ctrl.deleteAddress = (addressParam) => {
    ModalService.showModal({
      templateUrl: "shared/views/tmpl-popup-confirm.html",
      inputs: {
        textDeleteModal:  addressParam.streetAddress.street        + ' ' +
                          addressParam.streetAddress.streetNumber  + ' ' +
                          addressParam.place.city                  + ' ' +
                          addressParam.place.province              + ' ' +
                          ' - '                                    + 
                          addressParam.place.countryCode,
        deleteElement: addressParam
      },
      controller: 'DeleteAddressAmModalController',

      preClose: function preClose(modal) {
        modal.element.modal('hide');
      }
    }).then(function (modal) {
      modal.element.modal();
      modal.close.then((address) => {
        if(address){
          userService.deleteAddress(address.id).then( ()=> { $ctrl.refreshCallback() },function(error) {
            errorService.handle(err)
          });
        }
      });
    });

  }

  $ctrl.showModalDireccion = function(addressParam){
    ModalService.showModal({
      templateUrl: 'dashboard-user/views/tab-profile/modals-view/tmpl-addresses-popup.html',
      backdrop: 'static',
      keyboard: false,
      controller: "ShowAddressAmModalController",
      size: 'lg',
      windowClass: 'my-modal',
      inputs: {
        address: addressParam
      },
      preClose: function(modal) {
        modal.element.modal('hide');
      }

    }).then(function (modal) {
      modal.element.modal();
      modal.close.then( (address)=>{
        const userId = localStorageService.get('userId');
        if(address){
          if(address.id){
            userService.updateAddress(address).then( ()=> { $ctrl.refreshCallback() },function(error) {
              errorService.handle(err)
            });
          }else{
            userService.addAddress(userId, address).then( ()=> { $ctrl.refreshCallback() },function(error) {
              errorService.handle(err)
            });
          }
          
        }
      })
      
    });
  }

}

