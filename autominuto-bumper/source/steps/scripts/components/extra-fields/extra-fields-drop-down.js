'use strict'

angular.module('amApp').component('extraFieldsDropDown', {
  templateUrl: 'steps/views/extra-fields/extra-fields-drop-down.html',
  controller: ExtraFieldsDropDownController,
  bindings: {
    component: '='
  }
})

function ExtraFieldsDropDownController() {

  const $ctrl = this
  $ctrl.options = []

  $ctrl.$onInit = () => {
    $ctrl.options = _.each($ctrl.component.options, b => { 
        b.label = b.name
        if (b.selected) { //preselected value
          $ctrl.initialValue = b.label
        }       
        b.name
      }
    )
  }

  $ctrl.saveSelectedOption = () => {
    $ctrl.component.options = _.each($ctrl.options, o => {
      o.selected = false
      if (o.label == $ctrl.selection.label) {
        o.selected = true
      }
    })
  }

}



// 'use strict'

// angular.module('amApp').component('extraFieldsDropDown', {
//   templateUrl: 'steps/views/extra-fields/extra-fields-drop-down.html',
//   controller: ExtraFieldsDropDownController,
//   bindings: {
//     component: '='
//   }
// })

// function ExtraFieldsDropDownController(EXTRA_FIELDS) {

//   const $ctrl = this
//   $ctrl.initialValue = null

//   $ctrl.$onInit = () => {
//     $ctrl.selectedComponent = _.filter($ctrl.component, c => c.componentType == EXTRA_FIELDS.DROP_DOWN)

//     $ctrl.options = _.each($ctrl.selectedComponent[0].options, b => { 
//         b.label = b.name
//         if (b.selected) {
//           $ctrl.initialValue = b.label
//         }
//         return b.name
//       }
//     )
//   }

//   $ctrl.saveSelectedOption = () => {
//     $ctrl.component = _.each($ctrl.component, c => {
//       if (c.componentType == EXTRA_FIELDS.DROP_DOWN) {
//         c.options = _.each(c.options, o => {
//           o.selected = false
//           if (o.label == $ctrl.selection.label) {
//             o.selected = true
//           }
//         })
//       }
//     })
//   }
  
// }
