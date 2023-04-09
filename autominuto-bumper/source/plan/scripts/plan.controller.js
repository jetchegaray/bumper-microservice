'use strict'

angular.module('amApp').controller('PlanController', PlanController)

function PlanController($state, $stateParams, planService, userService, errorService) {
  const $ctrl = this

  $ctrl.dataUser = userService.getUserData()

  $ctrl.annual = true;
  $ctrl.credit_cards = []
  $ctrl.others = []
  $ctrl.discount = 0

  $ctrl.quotesAmountFree = 0
  $ctrl.couponsAmountFree = 0
  $ctrl.priceHighline = 0
  $ctrl.priceHighlinePerMonth = 0
  $ctrl.closeTooltip = true
  $ctrl.commerceId  = null

  $ctrl.$onInit = () => {
    $.LoadingOverlay('show')
   
    const paymentMethodsRequest = $ctrl.paymentsMethods()
    const plansRequest = $ctrl.plans()


    Promise.all([paymentMethodsRequest, plansRequest]).then(() => {
        $.LoadingOverlay('hide')
        if ($stateParams.commerceId != undefined){
          $ctrl.commerceId = $stateParams.commerceId
        }
    })
  }

  $ctrl.paymentsMethods = () => {
     planService.paymentMethodsName()
      .then(function (data) {
        $ctrl.credit_cards = data.credit_cards
        $ctrl.others = data.others
      })
      .catch(err => {
        console.log("Error al obtener las tarjetas: ", err)
      })
  }


   $ctrl.plans = () => {
     planService.plans()
      .then(function (data) {
         $ctrl.quotesAmountFree = data[0].quoteAmount
         $ctrl.couponsAmountFree = data[0].couponAmount
         $ctrl.priceHighline = data[1].price*12
         $ctrl.priceHighlinePerMonth = data[1].price
      })
      .catch(err => {
        errorService.handle(err)
      })
  }

  //{discount: $ctrl.discountAmount, code: $ctrl.code}
  $ctrl.onSuccess = (discount, code) => {
    $ctrl.discount = discount
    $ctrl.closeTooltip = false
    $ctrl.tooltipTitle = "Contrata ya con "+discount+"% de descuento"
  }


  $ctrl.registerNow = () => {
   
    if (userService.authenticated()) {
   
      if ($ctrl.commerceId == undefined) {
        userService.getCommerces(userService.getUserData().id, 1)
        .then(res => {

          if (res.total > 0) {
            $ctrl.commerceId = res.data[0].id
            $ctrl.selectedPlan()
          } else {
            $state.go("board.user.profile")
          } 
        })
        .catch(err => errorService.handle(err))
      } else {
        $ctrl.selectedPlan()
      }  
     
    } else {
      $state.go("login")
    }  
  }

  $ctrl.selectedPlan = () => {
     let payment = {
        planType : "FREE",
        months : 12,
        status: "APPROVED"
      }
      $.LoadingOverlay("show")
      planService.selectedPlan($ctrl.commerceId, payment).then((data) => {   

        $state.go("board.commerce.shop", { commerceId : $ctrl.commerceId, plan : "FREE" , state : "success"})
      }).catch(err => {
        errorService.handle(err) 
        $.LoadingOverlay("hide")
      })
  }

  $ctrl.payNow = name => {
    //if (userService.authenticated()) {

      if ($stateParams.commerceId == undefined) {
        userService.getCommerces(userService.getUserData().id, 1)
        .then(res => {
          if (res.total > 0) {
            $ctrl.commerceId = res.data[0].id
            $ctrl.suscriptionMP(name)
          } else {
            $state.go("board.user.profile")
          }
        })
        .catch(err => errorService.handle(err))
      } else {
        $ctrl.suscriptionMP(name)
      } 
      
   // } else {
  //    $state.go("login")
   // }

  }


  $ctrl.suscriptionMP = name => {
    $.LoadingOverlay("show")
    const title = 'Subscription FULL Autominuto - User mail : ' + userService.getUserData().email 

    const payment = {
      annual : $ctrl.annual,
      title : title,
      discount : $ctrl.discount,
      pricePerMonth : $ctrl.priceHighlinePerMonth
    }
    planService.subscription(name, $ctrl.commerceId, payment)
      .then(function (data) {
         if (data.status === 201){
            window.location.href = data.response.init_point
          }
      })
    .catch(err => {
      errorService.handle(err)
    })
    .then(() => {
      $.LoadingOverlay("hide")
    })
  }

}
