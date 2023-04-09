const rest 			  = require('restler');
const constants       = require('../utils/constants');
const express 		  = require('express');
const headers         = require('../utils/headers');
const winston     	  = require('winston')
const config      = require('../config')
const mpClient     = require('../utils/autominuto-mp')
const moment       = require('moment')

const router = express.Router();

router.post('/:name', function (req, res) {
  const name = req.params.name
  const commerceId = req.query.commerceId
  const payment = req.body.data
  const discountPercent = payment.discount
  //const amount = name.toLowerCase() === "HIGHLINE" ? 100 : 300
  const amount = 100

 // let discount =  discountPercent === 0 ? 1 : discountPercent
  const months = (payment.annual == true) ? 12 : 6
  //if (discount == 1 && payment.annual){ // if there is no discount --> 20% annual.
  //  discount = 20
  //}
  //const price = (discount == 1) ? (amount * months) : ((amount * months * (100 - discount)) / 100)
  let day = moment(new Date()).day()
  let oneYearLater = moment(new Date()).add(1, "years")
  let price = payment.pricePerMonth

  rest.get(`${config.HOST}/api/commerce/find/${commerceId}`, {headers: headers.traderHeader})
    .on('success', data => {
    const item = {
        "reason": payment.title,
        "payer_email": data.email,
        "external_reference": `commerceId=${commerceId},type=${constants.PAYMENT_TYPE.PLAN},planType=${name},months=${months}`,
        "back_url" : config.HOST + "/board/commerce/" + commerceId + "/quotes?plan="+ name +"&state=SUCCESS",
        "auto_recurring": {
          "frequency": 1,
          "frequency_type": "months",
          "transaction_amount": price,
          "currency_id": "ARS",
          "repetitions": 12,
          "debit_date": day,
          "end_date": oneYearLater
        }
      }
      mpClient.createSubscription(item).then(data => {
        console.log(data)
        return res.send(data)
      }).catch(err => {
        console.log(err)
        return res.send(err)
      })

/*
    mpClient.createPayment({
      'items': [{
        'title': payment.title,
        "payer_email": data.email,
        'picture_url': 'http://www.autominuto.com/assets/images/icons/autominuto.png',
        'quantity': 1,
        //'quantity': price*months,
        'currency_id': 'ARS',
        //'unit_price': 20,
        'unit_price': price
      }],
      'external_reference': `commerceId=${commerceId},type=${constants.PAYMENT_TYPE.PLAN},planType=${name},months=${months}`,
      'back_urls': {
        'success': config.HOST + "/board/commerce/" + commerceId + "/products?plan="+ name +"&state=SUCCESS",
        'failure': config.HOST + "/board/commerce/" + commerceId + "/products?plan="+ name +"&state=SUCCESS",
        'pending': config.HOST + "/board/commerce/" + commerceId + "/products?plan="+ name +"&state=SUCCESS"
      },
      'auto_return' : 'approved'
    }).then(data => {
      winston.log("data", data) 
      res.send(data)})
    .catch(err => {
      console.log("error", err)
      res.send(err)
    })
    */
  })
})


router.post('/selected/commerce/:commerceId', function (req, res) {
  const commerceId = req.params.commerceId;
  let data = req.body.data
  
  rest.postJson(constants.SUBSCRIPTION_API_END_POINT + 'selected/commerce/' + commerceId, data, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send(data)
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
})





router.post('/update/commerce/:commerceId', function (req, res) {
  const commerceId = req.params.commerceId;
  let data = req.body.data

  rest.postJson(constants.SUBSCRIPTION_API_END_POINT + 'update/commerce/'+ commerceId, data, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send(data)
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
})




router.get('status/commerce/:commerceId', function (req, res) {
  const commerceId = req.params.commerceId;

  rest.get(constants.SUBSCRIPTION_API_END_POINT + 'status/commerce/' + commerceId, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send(data)
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
})


router.get('/plans', function (req, res) {
  
  rest.get(constants.SUBSCRIPTION_API_END_POINT + 'plans', {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send(data)
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
})



module.exports = router;
