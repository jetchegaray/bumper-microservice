const constants = require('../utils/constants')
const rest = require('restler')
const headers = require('../utils/headers')
const winston = require('winston')

exports.findCommerceByAccountId = (accountId) => {
  return new Promise((resolve, reject) => {
    rest.get(constants.PAYMENT_API_END_POINT + 'account/' + accountId + '/commerce' , {headers: headers.traderHeader})
      .on('success', data => resolve(data))
      .on('fail', err => {
        if (err.httpStatus === 500) winston.error(err)
        reject(err)
      })
  })
}

exports.saveCommerceAccount = (commerceId, account) => {
  return new Promise((resolve, reject) => {
    rest.postJson(constants.PAYMENT_API_END_POINT + '/account/commerce/' + commerceId + '/save', account, {headers : headers.traderHeader})
      .on('success', data => resolve(data))
      .on('fail', (response, data) => reject({response, data}))
  })
}
