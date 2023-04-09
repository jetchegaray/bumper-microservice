const rest 			  = require('restler');
const constants       = require('../utils/constants');
const express 		  = require('express');
const headers         = require('../utils/headers');
const winston     	  = require('winston')
const moment    = require('moment')
const config = require('../config')
const mpClient     = require('../utils/autominuto-mp')
const _     = require('underscore')
const MP = require('mercadopago')
const imageTransformer     = require('../utils/imageTransformer')
const couponService = require('../service/couponService')
const paymentService = require('../service/paymentService')
const {validateToken} = require('../utils/authMiddleware')

const router = express.Router();

router.get('/methods', function (req, res) {

  mpClient.getPayments().then(function(data) {
    response = {}
    response.credit_cards = _.chain(data.response).filter(function(method){return method.payment_type_id == "credit_card" && method.id != "cobroexpress"}).map(function(method){ return method.secure_thumbnail})
  	response.others = _.chain(data.response).filter(function(method){return method.payment_type_id != "credit_card" && method.id != "cobroexpress"}).map(function(method){ return method.secure_thumbnail})

    return res.send(response)
  }).catch(function(err) {
  	return res.send(err)
  })
})

router.get('/methods-name', function (req, res) {

  mpClient.getPayments().then(function(data) {
    response = {}
    response.credit_cards = _.chain(data.response).filter(function(method){return method.payment_type_id == "credit_card" && method.id != "cobroexpress"}).map(function(method){ return method.id})
    response.others = _.chain(data.response).filter(function(method){return method.payment_type_id != "credit_card" && method.id != "cobroexpress"}).map(function(method){ return method.id})

    return res.send(response)
  }).catch(function(err) {
    return res.send(err)
  })
})



// this is for the page of product details.
router.get('/checkout-link', validateToken, (req, res) => {
  const commerceId = req.query.commerceId
  const userId = req.query.buyerId
  const discountCode = req.query.discountCode
  
  const product = {
    id: req.query.productId,
    name: req.query.productName,
    description: req.query.productDescription,
    price: req.query.productPrice
  }
  const handleError = (data, response) => {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
  const getFeeFromPrice = price => {
    const fee = (price * constants.MERCADOPAGO.FEE) / 100
    return Math.round(fee * 100) / 100
  }
  rest.get(`${config.HOST}/api/user/getUserData/${userId}`, {headers: headers.traderHeader})
    .on('success', data => {
      const preference = {
        'items': [
          {
            'id': product.id,
            'title': product.name,
            'description': product.description,
            'quantity': 1,
            'currency_id': 'ARS',
            'unit_price': Math.round(product.price * 100) / 100
          }
        ],
        'external_reference': `productId=${product.id},commerceId=${commerceId},userId=${userId},discountCode=${discountCode},type=${constants.PAYMENT_TYPE.PRODUCT}`,
        'marketplace_fee': getFeeFromPrice(product.price),
        'payer': {
          'email': data.email
        },
        'back_urls': {
          'success': config.HOST + '/board/user/quotes',
          'failure': config.HOST + '/board/user/quotes',
          'pending': config.HOST + '/board/user/quotes'
        }
      }
      rest.get(constants.PAYMENT_API_END_POINT + 'account/commerce/' + commerceId, {headers: headers.traderHeader})
        .on('success', data => {
          const mercadopago = new MP(data.access_token)
          mercadopago.createPreference(preference)
            .then(preference => {
              res.send(preference.response.init_point)
            }).catch(err => {
              winston.log('error', {err})
              res.sendStatus(500)
            })
         })
         .on('fail', handleError)
    })
    .on('fail', handleError)
})







// this is repeat it with the above one.  but this one is for quote list when user accepeted one
//quote and wanting to pay 
router.get('/checkout-link-quote', validateToken, (req, res) => {
  const commerceId = req.query.commerceId
  const userId = req.query.buyerId
  const discountCode = req.query.discountCode

  console.log(JSON.stringify(req.query))
  const quote = {
    id: req.query.quoteId,
    replyId: req.query.quoteReplyId,
    name: req.query.productName,
    description: req.query.quoteDescription,
    price: req.query.quotePrice
  }
  const handleError = (data, response) => {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
  const getFeeFromPrice = price => {
    const fee = (price * constants.MERCADOPAGO.FEE) / 100
    return Math.round(fee * 100) / 100
  }
  
  rest.get(`${config.HOST}/api/user/getUserData/${userId}`, {headers: headers.traderHeader})
    .on('success', data => {
      const preference = {
        'items': [
          {
            'id': quote.id,
            'title': quote.name,
            'description': quote.description,
            'quantity': 1,
            'currency_id': 'ARS',
            'unit_price': Math.round(quote.price * 100) / 100
          }
        ],
        'external_reference': `quoteId=${quote.id},quoteReplyId=${quote.replyId},commerceId=${commerceId},userId=${userId},discountCode=${discountCode},type=${constants.PAYMENT_TYPE.QUOTE}`,
        'marketplace_fee': getFeeFromPrice(quote.price),
        'payer': {
          'email': data.email
        },
        'back_urls': {
          'success': config.HOST + '/board/user/quotes',
          'failure': config.HOST + '/board/user/quotes',
          'pending': config.HOST + '/board/user/quotes'
        }
      }
      rest.get(constants.PAYMENT_API_END_POINT + 'account/commerce/' + commerceId, {headers: headers.traderHeader})
        .on('success', data => {
          const mercadopago = new MP(data.access_token)
          mercadopago.createPreference(preference)
            .then(preference => {
              res.send(preference.response.init_point)
            }).catch(err => {
              winston.log('error', {err})
              res.sendStatus(500)
            })
         })
         .on('fail', handleError)
    })
    .on('fail', handleError)
})



router.post('/coupon/:code', validateToken, function (req, res) {
  const commerceId = req.query.commerceId;
  const couponId = req.params.code
  const userId = req.query.userId
  mpClient.createPayment({
    'items': [{
      'title': 'Cupon Autominuto',
      'picture_url': '',
      'quantity': 1,
      'currency_id': 'ARS',
      'unit_price': 100,
      //'unit_price': 1
    }],
    'external_reference': `commerceId=${commerceId},type=${constants.PAYMENT_TYPE.COUPON},couponId=${couponId},userId=${userId}`,
    'back_urls': {
      'success': config.HOST + '/board/user/coupons',
      'failure': config.HOST + '/board/user/coupons',
      'pending': config.HOST + '/board/user/coupons'
    },
    'auto_return' : 'approved'
  }).then(data => res.send(data))
    .catch(err => res.send(err))
})


router.post('/validatePromotionCode/:code', function (req, res) {
  const code = req.params.code

  rest.get(constants.PROMOTION_API_END_POINT + 'validate/' + code, {headers: headers.traderHeader})
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



router.post('/coupon/:couponId/save', function (req, res) {
  const couponId = req.params.couponId
  const userId = req.query.userId;
  const dataPayment = JSON.parse(req.body.data)

  couponService.savePayment(couponId, userId, dataPayment)
    .then(d => res.send(d))
    .catch(handleError)

  function handleError({data, response}) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }
})


router.post('/product/:productId/save', function (req, res) {
  const productId = req.params.productId
  const userId = req.query.userId;
  const commerceId = req.query.commerceId;
  let data = JSON.parse(req.body.data)

  rest.postJson(constants.PAYMENT_API_END_POINT + 'product/save?userId=' + userId + '&productId=' + productId + '&commerceId=' + commerceId, data, {headers: headers.traderHeader})
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




router.get('/product/buys', function (req, res) {
  const userId = req.query.userId;
  const page = req.query.page;
  let userBuys = []
  let formatDate = "DD-MM-YYYY hh:mm"
  let formatOutput = "DD-MM-YYYY hh:mm"


  rest.get(constants.PAYMENT_API_END_POINT + 'products/bought?userId=' + userId + '&page=' + page, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send({userQuotes: processBuys(data.data), totalPages: Math.ceil(data.total / data.perPages), filterToShow: 'buys'})
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }


  function processBuys(buys) {

    _.each(buys, function(buy) {
      let item = {}
      item.user = getUserData(buy)
      item.paidAt = (buy.paidAt) ? moment(buy.paidAt, formatDate).format(formatOutput) : ""
      item.paymentId = buy.boughtId
      item.product = getProductData(buy)
      item.boughtId = buy.boughtId
      item.commerce = buy.commerceView
      item.commerce.logo = imageTransformer.getCommerceLogoFromImages(item.commerce.images, item.commerce.id, 90, 90);

      userBuys.push(item)
    })
    return userBuys
  }

  function getUserData(buy) {
    return {
      username: buy.user.nickName || buy.user.email,
      userPhoto: imageTransformer.getImageUserPath(buy.user.id, buy.user.imageName, 200, 200)
    }
  }

  function getProductData(buy) {
    let imageName = imageTransformer.getImageMainProductPath(buy.product.id, buy.product.images, 80, 80)
    if (!imageName){
      imageName = imageTransformer.getImageProductDisk(buy.product.serviceType)   
    }
    return {
      name: buy.product.name,
      image: imageName,
      description : buy.product.description,
      service : buy.product.serviceType.service,
      price : buy.product.price,
      category : buy.product.serviceType.name,
      commerceId: buy.product.commerceId
    }
  }
})






router.get('/product/sales', function (req, res) {
  const commerceId = req.query.commerceId
  const page = req.query.page
  let commerceSales = []
  let formatDate = "DD-MM-YYYY hh:mm"
  let formatOutput = "DD-MM-YYYY hh:mm"


  rest.get(constants.PAYMENT_API_END_POINT + 'products/sales?commerceId=' + commerceId + '&page=' + page, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    return res.send({userQuotes:processSales(data.data), totalPages: Math.ceil(data.total / data.perPages), filterToShow: 'sales'})
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }

  function processSales(salesCommerce) {

    _.each(salesCommerce, function(sale) {
      let item = {}

      item.user = getUserData(sale)
      item.paidAt = (sale.paidAt) ? moment(sale.paidAt, formatDate).format(formatOutput) : ""
      item.paymentId = sale.boughtId
      item.product = getProductData(sale)

      commerceSales.push(item)
    })
    return commerceSales
  }

  function getUserData(sale) {
    return {
      username: sale.user.nickName || sale.user.email,
      userPhoto: imageTransformer.getImageUserPath(sale.user.id, sale.user.imageName)
    }
  }


  function getProductData(sale) {
    let imageName = imageTransformer.getImageMainProductPath(sale.product.id, sale.product.images, 80, 80)
    if (!imageName){
      imageName = imageTransformer.getImageProductDisk(sale.product.serviceType)   
    }
    
    return {
      name: sale.product.name,
      image: imageName,
      description : sale.product.description,
      service : sale.product.serviceType.service,
      price : sale.product.price,
      category : sale.product.serviceType.name,
      boughtId: sale.boughtId
    }
  }
})


router.get('/:paymentId', function (req, res) {
  const paymentId = req.params.paymentId;

  rest.get(constants.PAYMENT_API_END_POINT + paymentId, {headers: headers.traderHeader})
    .on('success', handleSuccess)
    .on('fail', handleError)

  function handleSuccess(data) {
    data.commerceImages = imageTransformer.getCommerceLogo(data.commerceView.images, data.commerceView.id)

    return res.send(data)
  }

  function handleError(data, response) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data)
  }


})


router.post('/:paymentId/rating/save', function (req, res) {
  const paymentId = req.params.paymentId

  rest.postJson(constants.PAYMENT_API_END_POINT + paymentId + '/rating/save', req.body.data, {headers : headers.traderHeader})
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


router.get('/account/commerce/:commerceId', function (req, res) {
  const commerceId = req.params.commerceId;

  rest.get(constants.PAYMENT_API_END_POINT + '/account/commerce/' + commerceId, {headers: headers.traderHeader})
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



router.get('/has/account/commerce/:commerceId', function (req, res) {
  const commerceId = req.params.commerceId;

  rest.get(constants.PAYMENT_API_END_POINT + 'has/account/commerce/' + commerceId, {headers: headers.traderHeader})
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


router.post('/account/commerce/:commerceId/save', function (req, res) {
  const commerceId = req.params.commerceId;
  const account = req.body.data
  paymentService.saveCommerceAccount(commerceId, account)
    .then(data => res.send(data))
    .catch(handleError)

  function handleError(err) {
    winston.log('error', {data})
    if (data.httpStatus) return res.status(data.httpStatus).send(data)
    if (response.status) return res.status(response.status).send(data)
    return res.status(500).send(data);
  }
})

module.exports = router;
