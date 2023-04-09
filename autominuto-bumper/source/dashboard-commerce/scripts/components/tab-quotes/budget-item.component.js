'use strict'

angular.module('amApp').component('budgetItem', {
  controller: BudgetItemController,
  templateUrl: "dashboard-commerce/views/tab-quotes/budget-item.html",
  bindings: {
    budget: '<',
    updatePage: '<',
    currentFilter: '<'
  }
})

function BudgetItemController(quoteService, ModalService, $stateParams, $scope, productService, locationService, errorService, MAX_COMMENT_LENGTH, $window) {
  var $ctrl = this

  $ctrl.getMaxCommentLength = () => {
    return MAX_COMMENT_LENGTH;
  }

  $ctrl.isCommentMaxLength = (comment) => {
    return comment.length > MAX_COMMENT_LENGTH;
  }

  $ctrl.getLocationParsed = (location) => {
    if(location){
      return locationService.getAddressLineWithoutStreet(location)
    }

  }

  $ctrl.$onInit = () => {
  }

  $ctrl.rejectBudget = function (quote) {
    $window.fbq('track', 'dashboardCommerceQuoteClickRejectBudget')

    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-quotes/popup-build-quote-refuse.html",
      inputs: {
        issue: quote.issue,
        userName: quote.userFrom.username,
        modelCar: {
          brandName: quote.modelCar.brandName,
          subBrandName : quote.modelCar.subBrandName
        },
        sent: quote.createdOn
      },
      controller: 'RejectBudgetAmModalController',
      preClose: function(modal) {
        modal.element.modal('hide');
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(form) {

        if(form) {
          const status = "refused"
          let data = {
            comment: form.comments,
            status: status,
            noGivenService : form.checkNoGivenService
          }

          $.LoadingOverlay("show")
          quoteService.rejectQuote(data, $stateParams.commerceId, quote.quoteId)
            .then(() => {
              $window.fbq('track', 'dashboardCommerceQuoteSentRejectBudget')
              $ctrl.updatePage()
            })
            .catch(err => {
              $window.fbq('track', 'dashboardCommerceQuoteSentRejectBudgetError')
              errorService.handle(err)
            })
            .then(() => {
              $.LoadingOverlay("hide")
            })
        }
      })

    });
  }

  $ctrl.buildBudget = (quote) => {
    (quote.issue.product) ? buildProductBudget(quote) : buildServiceBudget(quote)
  }

  function buildServiceBudget(quote) {

    $window.fbq('track', 'dashboardCommerceQuoteClickBuildServiceBudget')

    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-quotes/popup-build-quote-service.html",
      controller: "BuildServiceBudgetController",
      inputs: {
        issue: quote.issue,
        userName: quote.userFrom.username,
        modelCar: quote.modelCar,
        sent: quote.createdOn,
        showHelpCost: quote.quoteType === "TURN_REQUEST",
        serviceType: quote.serviceType,
        possibleAppointments: quote.possibleAppointments,
        location: quote.location,
        explanations: quote.explanations
      },
      preClose: function(modal) {
        modal.element.modal('hide');
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(servicesData) {
        if(servicesData) {

          let commerceAppointments
          let selectedAppointment
          let possibleAppointments

          if(servicesData.services.othersAppointments){
            commerceAppointments = buildDateTimesAppointments(servicesData.services.datetimes)
          } else{
            selectedAppointment = servicesData.services.appointmentSelected
          }

          possibleAppointments = mergeCommerceAndDriverAppointments(servicesData.services.driverAppointments, selectedAppointment, commerceAppointments)

          const status ="replied"

          let data = {
            cost: servicesData.services.cost,
            freeService: servicesData.services.freeService,
            comment: servicesData.services.comments,
            possibleAppointments: possibleAppointments,
            status: status
          }

          let saveServiceData = {
            name: servicesData.services.name,
            price: servicesData.services.cost,
            description: servicesData.services.comments,
            service: true,
            serviceType: servicesData.serviceType
          }

          $.LoadingOverlay("show")

          if(servicesData.services.quoteable){

            const repliesRequest = quoteService.saveReply(data, $stateParams.commerceId, quote.quoteId, saveServiceData, {})
            Promise.all([repliesRequest]).then(() => {
              $window.fbq('track', 'dashboardCommerceQuoteRepliedServiceBudget')
              $ctrl.updatePage()
            }).catch(err => {

              $window.fbq('track', 'dashboardCommerceQuoteRepliedServiceBudgetError')
              errorService.handle(err)
            }).then(() => {
              $.LoadingOverlay("hide")
            })

          }else {

            quoteService.saveReply(data, $stateParams.commerceId, quote.quoteId)
            .then(() => {
              $window.fbq('track', 'dashboardCommerceQuoteRepliedServiceBudget')
              $ctrl.updatePage()
            })
            .catch(err => {

              $window.fbq('track', 'dashboardCommerceQuoteRepliedServiceBudgetError')
              errorService.handle(err)
            })
            .then(() => {
              $.LoadingOverlay("hide")
            })
          }
        }


        function mergeCommerceAndDriverAppointments(driverAppointments, selectedAppointment, commerceAppointments){
          let possibleAppointments = []

          if(selectedAppointment && selectedAppointment.date){
            let appointmentFound = _.find(driverAppointments, function(appointment) { return appointment.date == selectedAppointment.date})
            appointmentFound.chooseIt = true
            appointmentFound.date = appointmentFound.date
            possibleAppointments.push(appointmentFound)

          } else {

              let filteredAppointments = commerceAppointments.filter(function(appointment){
                var finded = false
                appointment.chooseIt == false
                for(var i = 0; i < driverAppointments.length; i++){
                  if(appointment.date == driverAppointments[i].date){
                    appointment.chooseIt = true
                    break
                  }
                }
                return appointment
              })
              possibleAppointments = filteredAppointments
          }
          return possibleAppointments
        }

        function buildDateTimesAppointments(items) {
          let possibleAppointments = []

          for(let index = 0; index < items.length; index++) {
            let item = items[index]
            possibleAppointments.push({"date": item.date + " " + item.time, chooseIt: false})
          }

          return possibleAppointments
        }

      })

    });
  }

  function buildProductBudget(quote) {
    $window.fbq('track', 'dashboardCommerceQuoteClickBuildProductBudget')

    ModalService.showModal({
      templateUrl: "dashboard-commerce/views/tab-quotes/popup-build-quote-product.html",
      controller: "BuildProductBudgetController",
      inputs: {
        issue: quote.issue,
        userName: quote.userFrom.username,
        modelCar: quote.modelCar,
        sent: quote.createdOn,
        showHelpCost: quote.quoteType === "QUOTE_REQUEST",
        serviceType: quote.serviceType,
        possibleAppointments: quote.possibleAppointments,
        location: quote.location,
        explanations: quote.explanations
      },
      preClose: function(modal) {
        modal.element.modal('hide');
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(productsData) {
        if(productsData) {

          const status = "replied"

          let replies = []
          angular.forEach(productsData.services, function(key, value){
            this.push({'cost': key.price, 'status': status, 'comment' : key.description})
          }, replies)

          let fileImages = productsData.fileImages
          let saveThemAtStore = productsData.saveThemAtStore

          const repliesRequest = quoteService.saveReplies(replies, $stateParams.commerceId, quote.quoteId, productsData, fileImages, saveThemAtStore)

          $.LoadingOverlay('show')

          Promise.all([repliesRequest]).then(() => {
            $window.fbq('track', 'dashboardCommerceQuoteRepliedProductBudget')
            $ctrl.updatePage()
          }).catch(err => {
            $window.fbq('track', 'dashboardCommerceQuoteRepliedProductBudgetError')
            errorService.handle(err)
          }).then(() => {
            $.LoadingOverlay("hide")
          })

        }

      })

    });
  }

  $ctrl.getMainTitle = (quoteType) => {
    if(quoteType === "TURN_REQUEST") {
      return "Pedido de turno"
    }
    return "Pedido de cotización"
  }


  $ctrl.getLegend = (budget) => {

    $ctrl.legendImage

    if(budget && budget.replies && budget.replies[0].status === "replied") {
      $ctrl.legendImage = 'requested'
      return "Esperando confirmacion del usuario"
    }

  /*  if(budget.replies && budget.replies[0].status === "accepted_user") {
      $ctrl.legendImage = 'replied'
      return "El usuario concurrirá en los horarios elegidos, en caso de modificaciones se comunicara telefonicamente"
    }
*/
    if(budget && budget.replies && budget.replies[0].status === "refused_user") {
      $ctrl.legendImage = 'confirm'
      return "El presupuesto fue rechazado  por el usuario"
    }

    return ""
  }



}
