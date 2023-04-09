const rest = require('restler')
const constants = require('../utils/constants')
const headers = require('../utils/headers');
const couponService = require('./couponService')
const winston = require('winston')
const moment = require('moment')

const processors = {
  [constants.PAYMENT_TYPE.PRODUCT]: ({payment, reference, productId}) => {
    winston.info('Process Payment Product')
    return new Promise((resolve, reject) => {
      rest.postJson(`${constants.PAYMENT_API_END_POINT}product/save?userId=${reference.userId}&productId=${productId}&commerceId=${reference.commerceId}&discountCode=${reference.discountCode}`,
        payment, {headers: headers.traderHeader})
        .on('success', () => { resolve() })
        .on('fail', err => reject(err))
    })
  },
  [constants.PAYMENT_TYPE.QUOTE]: ({payment, reference, productId}) => {
    winston.info('Process Payment Quote')
    return new Promise((resolve, reject) => {
      console.log("About to update quote")
      rest.postJson(`${constants.QUOTE_API_END_POINT}${reference.quoteId}/status/${reference.quoteReplyId}`,
        {status: "finished"}, {headers: headers.traderHeader})
        .on('success', () => {resolve() })
        .on('fail', err => reject(err))
    })
  },
  [constants.PAYMENT_TYPE.SUBSCRIPTION]: ({payment, reference}) => {
    winston.info('Process Payment Subscription')
    return new Promise((resolve, reject) => {
      payment.planType = reference.planType
      payment.months = reference.months
      rest.postJson(`${constants.SUBSCRIPTION_API_END_POINT}selected/commerce/${reference.commerceId}`,
        payment, {headers: headers.traderHeader})
        .on('success', () => resolve())
        .on('fail', err => reject(err))
    })
  },
  [constants.PAYMENT_TYPE.COUPON]: ({payment, reference}) => {
    winston.info('Process Payment Coupon')
    return new Promise((resolve, reject) => {
      couponService.savePayment(reference.couponId, reference.userId, payment)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  }
}

exports.process = ({paymentMP, order}) => {
  return new Promise((resolve, reject) => {
 //   const productId = order.items[0].id
    const reference = {}
   // order.external_reference.split(',').forEach(p => reference[p.split('=')[0]] = p.split('=')[1])
    paymentMP.external_reference.split(',').forEach(p => reference[p.split('=')[0]] = p.split('=')[1])
    const productId = reference.productId
    const payment = {
      isPaid: paymentMP.status === 'approved',
      status: paymentMP.status.toUpperCase(),
      paidAt: moment(paymentMP.date_created).format('DD-MM-YYYY HH:mm'),
      merchantOrderIdMP: paymentMP.order.id,
      paymentTypeMP: paymentMP.payment_type_id
    }
    winston.info('Payment:', payment)
    winston.info('Reference:', reference)
    processors[reference.type]({payment, reference, productId})
      .then(() => resolve())
      .catch(err => reject(err))
  })
}


