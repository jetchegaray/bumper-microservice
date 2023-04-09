'use strict'

angular.module('amApp').component('extraFieldsImages', {
  templateUrl: 'steps/views/extra-fields/extra-fields-images.html',
  controller: ExtraFieldsImagesController,
  bindings: {
    component: '='
  }
})

function ExtraFieldsImagesController() {

  const $ctrl = this
  $ctrl.imagePath = 'assets/images/icons/plus.svg'

  $ctrl.$onInit = () => {
  }

  $ctrl.showImageSection = (i) => {
    //let showAdd = ($ctrl.component && $ctrl.component.images[i-1] && !$ctrl.component.images[i] && !$ctrl.component.images[i+1]) || i == 1 //ONLY PLUS BUTTON

    if ($ctrl.component && $ctrl.component.images && !$ctrl.component.images[i] && $ctrl.component.images[i+1]) { //Delete one in the middle
      delete $ctrl.component.images[i]
    }

    // if (showAdd && i !== 1) {
    //   delete $ctrl.component.images[i]
    // }
    return (($ctrl.component && $ctrl.component.images) && ($ctrl.component.images[i] || $ctrl.component.images[i - 1]) || (i === 0))
  }

  $ctrl.convertToBase64 = (file, i) => {
      new Promise((resolve, reject) => {
        if (file) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        } else {
          resolve(null)
        }
      }).then( base64 =>
        $ctrl.component.images[i] = base64
      )
  }

}
