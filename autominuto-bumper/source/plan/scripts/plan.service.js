'use strict'

angular.module('amApp').factory('planService', planService)

function planService($http, API_END_POINT) {
  return {
    validate: validate,
    paymentMethodsName: paymentMethodsName,
    subscription: subscription,
    selectedPlan: selectedPlan,
    updatePlan: updatePlan,
    actualPlanStatus: actualPlanStatus,
    plans: plans,
  }

  function validate(code) {
    return $http.post(`${API_END_POINT}payment/validatePromotionCode/${code}`).then(responseHandler)
  }

  function paymentMethodsName() {
    return $http.get(`${API_END_POINT}payment/methods-name`).then(responseHandler)
  }

  function subscription(name, commerceId, payment) {
    return $http.post(`${API_END_POINT}subscription/${name}?commerceId=${commerceId}`, {data : payment}).then(responseHandler)
  }

  function selectedPlan(commerceId, payment) {
    return $http.post(`${API_END_POINT}subscription/selected/commerce/${commerceId}`, {data : payment}).then(responseHandler)
  }

  function updatePlan(commerceId, payment) {
    return $http.post(`${API_END_POINT}subscription/update/commerce/${commerceId}`, {data : payment}).then(responseHandler)
  }

  function actualPlanStatus(commerceId) {
    return $http.get(`${API_END_POINT}subscription/status/commerce/${commerceId}`).then(responseHandler)
  }

  function plans() {
    return $http.get(`${API_END_POINT}subscription/plans`).then(responseHandler)
  }

  function responseHandler(res) {
   if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }

}