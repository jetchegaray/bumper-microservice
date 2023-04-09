const autoMinutoMP     = require('../utils/autominuto-mp')
const MP = require('mercadopago')
const config = require('../config')
const constants = require('../utils/constants')
const request = require('request')
const moment = require('moment')
const paymentService = require('../service/paymentService')
const winston = require('winston')

exports.getOrderByResource = (resourceType, resourceId, accessToken) => {
  return new Promise((resolve, reject) => {
    const MPClient = accessToken ? new MP(accessToken) : autoMinutoMP.getClientMP()
    MPClient.get({uri: `/v1/${resourceType}s/${resourceId}`, authenticate: true})
      .then(payment => {
            winston.info('getOrderByResource MercadoPago payment :', JSON.stringify(payment))
      //  MPClient.get({uri: `/merchant_orders/${payment.response.order.id}`, authenticate: true})
        //  .then(order => {
           // winston.info('merchant_orders MercadoPago payment :', JSON.stringify(order))
      
            resolve({paymentMP: payment.response, order: null})
          })
          .catch(err => reject(err))
      }).catch(err => reject(err))
 // })
}

exports.getUrlAuthorization = commerceId => {
  const redirectUri = `${constants.MERCADOPAGO.REDIRECT_URL}?commerceId=${commerceId}`
  const params = `?client_id=${config.MERCADOPAGO_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}`
  return `${constants.MERCADOPAGO.AUTHORIZATION_URL}${params}`
}

exports.processAuthorization = (code, commerceId) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: constants.MERCADOPAGO.CREDENTIALS_URL,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        client_secret: config.MERCADOPAGO_ACCESS_TOKEN,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${constants.MERCADOPAGO.REDIRECT_URL}?commerceId=${commerceId}`
      }
    }

    request.post(options, (e, r, body) => {
      if (e) throw e
      const dataToken = JSON.parse(body);
      const expiresIn = moment().add(dataToken.expires_in, 'seconds').format("DD-MM-YYYY HH:mm")
      const accountPayment = {
        accessToken: dataToken.access_token,
        publicKey: dataToken.public_key,
        userId: dataToken.user_id,
        refreshToken: dataToken.refresh_token,
        expiresIn
      }
      console.log("dataToken" + dataToken)
      console.log(accountPayment)
      paymentService.saveCommerceAccount(commerceId, accountPayment)
        .then(resolve())
        .catch(({response}) => {
          if (response.statusCode || response.status === 500) winston.log('error', {response})
          reject(response)
        })
    })
  })
}
