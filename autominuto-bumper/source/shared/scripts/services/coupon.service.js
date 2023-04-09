'use strict'

angular.module('amApp').factory('couponService', couponService)

function couponService($http, API_END_POINT, Upload) {
  return {
    getCouponsByCommerce: getCouponsByCommerce,
    getCouponsByUser: getCouponsByUser,
    createCoupon: createCoupon,
    deleteCoupon:deleteCoupon,
    editCoupon: editCoupon,
    buyCoupon: buyCoupon
  }

  function editCoupon(commerceId, coupon, file) {
    let data = angular.toJson(coupon)

    return Upload.upload({
      url: `${API_END_POINT}coupon/${commerceId}/edit/${coupon.id}`,
      data: {'data': data, files: file }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function getCouponsByCommerce(commerceId, page) {
    return $http.get(`${API_END_POINT}coupon/commerce/${commerceId}?page=${page}`).then(responseHandler)
  }

  function getCouponsByUser(userId, page) {
    return $http.get(`${API_END_POINT}coupon/user/${userId}?page=${page}`).then(responseHandler)
  }

  function createCoupon(commerceId, coupon, file) {
    let data = angular.toJson(coupon)

    return Upload.upload({
      url: `${API_END_POINT}coupon/generateCoupons?quantity=${coupon.quantity}&commerceId=${commerceId}`,
      data: {'data': data, files: file }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function deleteCoupon(couponId) {
    return $http.delete(`${API_END_POINT}coupon/${couponId}`).then(responseHandler)
  }

  function buyPaymentCoupon(couponCode, commerceId, userId) {
    return $http.post(`${API_END_POINT}payment/coupon/${couponCode}?commerceId=${commerceId}&userId=${userId}`).then(responseHandler)
  }

  function buyCoupon(couponCode, userId) {
    return $http.post(`${API_END_POINT}coupon/buyCoupon/${couponCode}?userId=${userId}`).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}


