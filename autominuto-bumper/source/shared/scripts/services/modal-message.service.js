'use strict'

angular.module('amApp').factory('modalMessageService', modalMessageService)

function modalMessageService(ModalService) {

  return {
    success: success,
    error: error,
    errorPassword : errorPassword,
    logout: logout,
    closeAllModals: closeAllModals
  }

  function success(title, message, callback){
    show(title, message, callback, 'success', false, "assets/images/icons/success-modal-thumb.svg", 'success')  
  }

  function error(title, message, callback){
    show(title, message, callback, 'danger', false, "assets/images/icons/error-modal-thumb.svg", 'danger')  
  }

  //it's missing a reverse image for thumbail.
  function errorPassword(title, message, callback){
    show(title, message, callback, 'danger', false, "assets/images/icons/error-modal_password.svg", 'danger')  
  }

  function logout(callback){
    show("Estás a punto de salir de tu cuenta", "¿Seguro que deseas continuar?", callback, 'danger', true, "assets/images/icons/exit-modal.svg", 'danger', "Salir", "Quiero Permanecer aqui !")  
  }

  function closeAllModals(){
    //The optionalResult parameter is pased into all close promises, the optionalDelay parameter has the same effect as the controller close function delay parameter.
    let optionalResult = ""
    let optionalDelay = 0 
    ModalService.closeModals(optionalResult, optionalDelay)
  }
  

  function show(title, message, callback, type, secondButton, modalImageRoute, titleColorType, labelButtonOne, labelButtonTwo) {
  
  	ModalService.showModal({
      templateUrl: 'shared/views/am-modal-message/am-modal.html', 
      preClose: (modal) => { modal.element.modal('hide') },
      controller: 'AmModalController as $ctrl',
      inputs: {
        title: title, 
        message: message,
        modalClass: 'modal-autominuto',
        colorType: type,
        dismissButton: true,
        secondButton: secondButton,
        modalImageRoute: modalImageRoute,
        titleColorType : titleColorType,
        labelButtonOne : labelButtonOne,
        labelButtonTwo : labelButtonTwo
      } 
    })
    .then(modal => {
	    modal.element.modal()
      if (callback) {
        modal.close.then(callback)
      } 	
    })
  }

}
