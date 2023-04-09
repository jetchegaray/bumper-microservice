const rest = require('restler');
const constants = require('../utils/constants');
const headers = require('../utils/headers');

exports.savePayment = (couponId, userId, payment) => {
  return new Promise((resolve, reject) => {
    rest.postJson(constants.PAYMENT_API_END_POINT + 'coupon/save?userId=' + userId + '&couponId=' + couponId, payment, {headers: headers.traderHeader})
      .on('success', data => {

	   	rest.postJson(constants.COUPON_API_END_POINT + "coupon/buyCoupon/" + couponCode + "?userId=" + userId,
      	{status: "finished"}, {headers: headers.traderHeader})
      	.on('success', () => resolve())
        .on('fail', err => reject(err))  
	
	    resolve(data)
          
    })
    .on('fail', err => reject(err))
	})
}
