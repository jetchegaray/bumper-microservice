'use strict'

angular.module('amApp').factory('paymentService', paymentService)

function paymentService($http, API_END_POINT) {
  return {
    savePaymentCoupon: savePaymentCoupon,
    savePaymentProduct: savePaymentProduct,
    getPaymentProductBought:getPaymentProductBought,
    getPaymentProductSales: getPaymentProductSales,
    saveRating: saveRating,
    findPayment: findPayment,
    getCommerceAccountPaymentMP: getCommerceAccountPaymentMP,
    saveCommerceAccountPaymentMP: saveCommerceAccountPaymentMP,
    hasCommerceAccountPaymentMP: hasCommerceAccountPaymentMP,
    getCheckoutLink: getCheckoutLink,
    getCheckoutLinkQuote : getCheckoutLinkQuote,
    getAuthorizationMPUrl: getAuthorizationMPUrl
  }

  function savePaymentCoupon(couponCode, userId, parameters) {
    return $http.post(`${API_END_POINT}payment/coupon/${couponCode}/save?userId=${userId}`, parameters).then(responseHandler);
  }

  function savePaymentProduct(productId, userId, commerceId, parameters) {
    return $http.post(`${API_END_POINT}payment/product/${productId}/save?userId=${userId}&commerceId=${commerceId}`, parameters).then(responseHandler);
  }

  function getPaymentProductBought(userId, page) {
    return $http.get(`${API_END_POINT}payment/product/buys?userId=${userId}&page=${page}`).then(responseHandler);
  }

  function getPaymentProductSales(commerceId, page) {
    return $http.get(`${API_END_POINT}payment/product/sales?commerceId=${commerceId}&page=${page}`).then(responseHandler);
  }

  function saveRating(paymentId, parameters) {
    return $http.post(`${API_END_POINT}payment/${paymentId}/rating/save`, parameters).then(responseHandler);
  }

  function findPayment(paymentId) {
    return $http.get(`${API_END_POINT}payment/${paymentId}`).then(responseHandler);
  }

  function getCommerceAccountPaymentMP(commerceId) {
    return $http.get(`${API_END_POINT}payment/account/commerce/${commerceId}`).then(responseHandler);
  }

  function hasCommerceAccountPaymentMP(commerceId) {
    return $http.get(`${API_END_POINT}payment/has/account/commerce/${commerceId}`).then(responseHandler);
  }

  function saveCommerceAccountPaymentMP(commerceId, parameters) {
    return $http.post(`${API_END_POINT}payment/account/commerce/${commerceId}/save`, parameters).then(responseHandler);
  }

  function getCheckoutLink(product, buyerId, commerceId, discountCode) {
    return $http.get(`${API_END_POINT}payment/checkout-link?productId=${product.id}&commerceId=${commerceId}&productName=${product.name}&productDescription=${product.description}&productPrice=${product.price}&buyerId=${buyerId}&discountCode=${discountCode}`).then(responseHandler)
  }

  function getCheckoutLinkQuote(quote, reply, discountCode) {
    const quoteName = quote.serviceType.name
    const quoteReplyId = reply.id
    const commerceId = reply.commerce.id
    const buyerId = quote.userFrom.id
    const description = quote.issue.detailIssue
    const price = reply.cost
    const quoteId = quote.quoteId
    return $http.get(`${API_END_POINT}payment/checkout-link-quote?quoteId=${quoteId}&commerceId=${commerceId}&productName=${quoteName}&quoteDescription=${description}&quotePrice=${price}&buyerId=${buyerId}&quoteReplyId=${quoteReplyId}&discountCode=${discountCode}`).then(responseHandler)
  }


  function getAuthorizationMPUrl(commerceId) {
    return $http.get(`${API_END_POINT}mercadopago/authorization-mp-url?commerceId=${commerceId}`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
