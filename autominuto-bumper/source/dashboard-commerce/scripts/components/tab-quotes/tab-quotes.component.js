'use strict'

angular.module('amApp').component('commerceBudgetTab', {
  templateUrl: 'dashboard-commerce/views/tab-quotes/tab-quotes.html',
  controller: TabPurchaseCommerceController,
  bindings: {
    getDataCommerce: '<',
  }
})

function TabPurchaseCommerceController($stateParams, quoteService, paymentService, localStorageService, planService, errorService) {
  var $ctrl = this

  $ctrl.categories = [
    { name: 'requested', title: 'Recibidos' },
    { name: 'replied', title: 'Respondidos' },
    { name: 'refused', title: 'Rechazados' },
    { name: 'accepted_user', title: 'Próximos Turnos' },
    { name: 'qualified', title: 'Calificados' },
    { name: 'sales', title: 'Ventas' },
  ]

  $ctrl.currentPage = 1;
  $ctrl.currentFilter = 'requested'
  $ctrl.popupValidate = $stateParams.plan && $stateParams.state

  $ctrl.showPopupValidate = () => {
    if($ctrl.popupValidate){
      ModalService.showModal({
        templateUrl: "dashboard-commerce/views/popup-validated.html",
        size: 'md',
        windowClass: 'my-modal',
        controller: 'CommonAmModalController',
        preClose: function(modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then();
      });
    }
  }

  $ctrl.$onInit = function() {

    $ctrl.loadQuotes();

    let hasCommerceAccountPaymentMP
    paymentService.hasCommerceAccountPaymentMP($stateParams.commerceId)
      .then((data) => {
      hasCommerceAccountPaymentMP = data.result
      if(hasCommerceAccountPaymentMP == 'false'){
        planService.paymentMethodsName()
        .then(function (data) {
          $ctrl.credit_cards = data.credit_cards
          $ctrl.others = data.others
          $ctrl.hasCommerceAccountPaymentMP = hasCommerceAccountPaymentMP
        })
        .catch(err => {
          console.log("Error al obtener las tarjetas: ", err)
        })
      }
    })
    .catch(err => {
      errorService.handle(err)
    })
    paymentService.getAuthorizationMPUrl($stateParams.commerceId)
      .then((link) => {
        $ctrl.authorizationUrl = link
    })
    $ctrl.showPopupValidate()
  }

  $ctrl.$onChanges = function (changes) {
    if (changes.currentFilter) {
      $ctrl.showMessage = false;
      if (changes.currentFilter.currentValue == $ctrl.filter) {
        loadElements($ctrl.currentPage, $ctrl.filter);
      }
    }
  }

  $ctrl.loadQuotes = (page, filter) => {

    page = page || $ctrl.currentPage;
    filter = filter || $ctrl.currentFilter;

    $ctrl.loadingContent = true;
    $ctrl.elementListData = null;

    return (getCurrentRequest())(page, filter)
      .then(function (data) {
        $ctrl.elementListData = data.userQuotes;
        $ctrl.totalPages = data.totalPages;
        $ctrl.filterToShow = data.filterToShow;
        $ctrl.filtersMetadata = data.filters;
        updatePaginationStatus();
      }).catch(function (err) {
        errorService.handle(err);
      }).then(function () {
        $ctrl.showMessage = true;
        $ctrl.loadingContent = false;
      });

  }

  function getCurrentRequest() {
    switch ($ctrl.currentFilter) {
      case 'requested':
      case 'replied':
      case 'refused':
      case 'accepted_user':
        return $ctrl.getBudgetsRequest;
      case 'sales':
        return $ctrl.getSalesRequest;
      case 'qualified':
        return $ctrl.getRatingsRequest;
    }
  }

  function updatePaginationStatus() {
    $ctrl.nextPageEnabled = $ctrl.currentPage >= $ctrl.totalPages ? false : true;
    $ctrl.previousPageEnabled = $ctrl.currentPage > 1 ? true : false;
  }

  $ctrl.getBudgetsRequest = (page, filter) => {
    let lastLogin = localStorageService.get("lastLogin");
    return quoteService.getAllByCommerce($stateParams.commerceId, filter, lastLogin, page)
  }

  $ctrl.getSalesRequest = (page, filter) => {
    return paymentService.getPaymentProductSales($stateParams.commerceId, page)
  }

  $ctrl.getRatingsRequest = (page, filter)=>{
    return quoteService.getAllRatings($stateParams.commerceId, page)
  }

  $ctrl.filterQuotes = function(quote) {
    if(quote.status === $ctrl.currentFilter) {
      return quote
    }
  }

  $ctrl.changeFilter = function(filtered) {
    $ctrl.currentFilter = filtered
    $ctrl.loadQuotes()
  }


  /*
    previous load current page I ask for the last element in te list and if is 1 then reload previous page
  */
  $ctrl.updatePage = function () {
    if ($ctrl.elementListData.length == 1 && $ctrl.currentPage > 1) {
      $ctrl.currentPage--;
    }
    $ctrl.loadQuotes();
  }

  $ctrl.loadNextPage = function () {
    $ctrl.currentPage++;
    $ctrl.loadQuotes();
  }

  $ctrl.loadPreviousPage = function () {
    $ctrl.currentPage--;
    $ctrl.loadQuotes();
  }

  $ctrl.goToMercadoPago = function () {
    window.location.href = $ctrl.authorizationUrl;
  }

}
