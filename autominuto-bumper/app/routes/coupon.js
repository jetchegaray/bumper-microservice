const rest = require('restler')
const constants = require('../utils/constants')
const express = require('express')
const headers = require('../utils/headers')
const path        = require('path')
const fs          = require('fs')
const _ = require('underscore')
const moment    = require('moment')
const winston     = require('winston')
const multiparty = require('connect-multiparty')
const multipartyMiddleware = multiparty()
const clientS3 = require('../utils/autominuto-s3')
const router = express.Router()
const couponTransformer = require('../utils/couponTransformer')


router.post('/:commerceId/edit/:couponId', multipartyMiddleware, function(req, res) {
//router.post('/:couponId/edit', function(req, res) {
  //updateCreateCoupon(req, res, constants.COUPON_API_END_POINT + '/' + req.params.couponId + '/edit', req.params.commerceId)
  let coupon = JSON.parse(req.body.data)
  let imageFile = req.files.files

  if(imageFile) {
    coupon.image = coupon.image || coupon.code + path.extname(imageFile.path)
  }
  coupon.serviceTypeIds = _.map(coupon.services, function(service){return service.id})
  delete coupon.services
  
  rest.postJson(constants.COUPON_API_END_POINT + '/' + req.params.couponId + '/edit', coupon, {headers : headers.traderHeader})
  .on('success', function(dataEdit, response){
      couponTransformer.addExtraInformationToCoupon(dataEdit, req.params.commerceId)

      if(imageFile) {
        let files = []
        files.push({
          key: 'coupons/' + req.params.commerceId + '/' + coupon.image,
          stream: fs.createReadStream(imageFile.path)
        })

        return clientS3.putBatch(files)
          .then(function(data) {
            return res.send({ coupon: dataEdit }) // util en la edicion
          })
          .catch(function(data) {
            return res.send(data)
          })
      } else {
        return res.send({ coupon: dataEdit })
      }
  }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })
})




router.post('/generateCoupons', multipartyMiddleware, function(req, res) {
  updateCreateCoupon(req, res, constants.COUPON_API_END_POINT + "/generateCoupons?quantity=" +
    req.query.quantity + "&commerceId=" + req.query.commerceId, req.query.commerceId)
})




function updateCreateCoupon(req, res, endpoint, commerceId) {
  let coupon = JSON.parse(req.body.data)
  let imageFile = req.files.files
  
  coupon.code = coupon.code || generateCode()

  if(imageFile) {
    coupon.image = coupon.image || coupon.code + path.extname(imageFile.path).toLowerCase()
  }

  coupon.serviceTypeIds = _.map(coupon.services, function(service){return service.id})
  delete coupon.services
  
  rest.postJson(endpoint, coupon, {headers : headers.traderHeader})
    .on('success', function(data, response){
      couponTransformer.addExtraInformationToCoupon(data, commerceId)

      if(imageFile) {
        let files = []
        files.push({
          key: 'coupons/' + commerceId + '/' + coupon.image,
          stream: fs.createReadStream(imageFile.path)
        })

        return clientS3.putBatch(files)
          .then(function(data) {
            return res.send({ coupon: coupon }) // util en la edicion
          })
          .catch(function(data) {
            return res.send(data)
          })
      } else {
        return res.send({ coupon: coupon })
      }

    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });

  function generateCode() {
    let code = ""
    let values = "abcdefghijklmnopqrstuvwxyz0123456789";

    for(let index = 0; index < 8; index++) {
      code += values.charAt(Math.floor(Math.random() * values.length));
    }

    return code
  }
}

router.delete('/:couponID', function(req, res) {
  rest.del(constants.COUPON_API_END_POINT + '/' + req.params.couponID, {headers : headers.traderHeader})
    .on('success', function (data, response) {
      res.send(data)
    })
    .on('fail', function (data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)  
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})


router.get('/commerce/:commerceID', function(req, res) {
  rest.get(constants.COUPON_API_END_POINT +'/commerce/' + req.params.commerceID + "?page=" + req.query.page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      let pages = getAmountPages(data.total, data.perPages)
      let coupons = data.data

      if(coupons.length) {
        coupons.forEach(function (coupon) {
          couponTransformer.addExtraInformationToCoupon(coupon, req.params.commerceID)
        })
      }

      //addExtraInformation(data.data, req.params.commerceID)
      res.send({coupons: data.data, pages: pages})
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})



router.get('/user/:userID', function(req, res) {
  rest.get(constants.COUPON_API_END_POINT +'/user/' + req.params.userID + "?page=" + req.query.page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      let pages = getAmountPages(data.total, data.perPages)
      let coupons = data.data

      if(coupons.length) {
        coupons.forEach(function (coupon) {
          couponTransformer.addExtraInformationToCoupon(coupon, coupon.commerceId)
        })
      }

      //addExtraInformation(data.data, req.params.commerceID)
      res.send({coupons: data.data, pages: pages})
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})


function getAmountPages(total, sizePage) {
  return Math.ceil(total/sizePage)
}



router.post('/buyCoupon/:couponId', multipartyMiddleware, function(req, res) {

  let couponId = req.params.couponId
  let userId = req.query.userId
  
  rest.postJson(constants.COUPON_API_END_POINT + '/buyCoupon/' + couponId + '?userId=' + userId, {}, {headers : headers.traderHeader})
  .on('success', function(data, response){
      res.send(data) 
  }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })
})


module.exports = router;
