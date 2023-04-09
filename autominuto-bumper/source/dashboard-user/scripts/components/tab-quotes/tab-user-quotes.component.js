
'use strict'

angular.module('amApp').component('userBudgetTab', {
  templateUrl: 'dashboard-user/views/tab-quotes/tab-user-quotes.html',
  controller: TabPurchaseUserController,
  bindings: {
  }
})

function TabPurchaseUserController(quoteService, paymentService, $state, userService, planService, errorService) {
  var $ctrl = this

  $ctrl.currentPage = 1;
  $ctrl.currentFilter = $state.params.filter || 'requested';

  $ctrl.categories = [
    { name: 'requested', title: 'Enviados' },
    { name: 'replied', title: 'Respondidos' },
    { name: 'accepted_user', title: 'Aceptados'},
    { name: 'finished', title: 'Finalizados' },
    { name: 'buys', title: 'Compras' },
  ];

  $ctrl.user = userService.getUserData()

  $ctrl.$onInit = function() {
    $ctrl.loadQuotes();
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
      case 'accepted_user':
      case 'refused_user':
      case 'finished':
        return $ctrl.getBudgetsRequest;
      case 'buys':
        return $ctrl.getBuysRequest;
    }
  }

  function updatePaginationStatus() {
    $ctrl.nextPageEnabled = $ctrl.currentPage >= $ctrl.totalPages ? false : true;
    $ctrl.previousPageEnabled = $ctrl.currentPage > 1 ? true : false;
  }

  $ctrl.getBudgetsRequest = (page, filter)=>{
    return quoteService.getAllByUser(filter, $ctrl.user.lastLogin, page)
  }

  $ctrl.getBuysRequest = (page, filter)=>{
    return paymentService.getPaymentProductBought($ctrl.user.id, page)
  }

  $ctrl.filterQuotes = function(quote) {
    if(quote.status === $ctrl.currentFilter) {
      return quote
    }
  }

  $ctrl.changeFilter = function(filtered) {
    $state.transitionTo('board.user.quotes', { filter: filtered }, { notify: false });
    $ctrl.currentFilter = filtered;
    $ctrl.loadQuotes();
  }

  /*
    previous load current page I ask for the last element in te list and if is 1 then reload previous page
  */
  $ctrl.updatePage = function () {
    if ($ctrl.elementListData.length == 1 && $ctrl.currentPage > 1) {
      $ctrl.currentPage--;
    }
    $ctrl.loadQuotes();
  };

  $ctrl.loadNextPage = function () {
    $ctrl.currentPage++;
    $ctrl.loadQuotes();
  };

  $ctrl.loadPreviousPage = function () {
    $ctrl.currentPage--;
    $ctrl.loadQuotes();
  };

  $ctrl.goToMercadoPago = function () {
    window.location.href = $ctrl.authorizationUrl;
  };

}
