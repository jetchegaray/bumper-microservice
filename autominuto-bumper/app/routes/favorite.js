const rest 			  = require('restler');
const constants   = require('../utils/constants');
const express 		= require('express');
const headers     = require('../utils/headers');
const winston     = require('winston')
const {validateToken} = require('../utils/authMiddleware')

const router = express.Router();

router.get('/has', validateToken, function(req, res) {
  rest.get(constants.FAVORITE_API_END_POINT + 'has?userId=' + req.query.userId + '&commerceId='+ req.query.commerceId,
    { headers: headers.traderHeader })
    .on('success', function(data, response) {
      return res.send(data)
    })
    .on('fail', function(data, response) {
      winston.log('error', { data: data })
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})

router.post('/save', validateToken, function (req, res) {
  rest.post(constants.FAVORITE_API_END_POINT + 'save?commerceId=' + req.query.commerceId + '&userId=' + req.query.userId,
    { headers: headers.traderHeader })
    .on('success', function (data, response) {
      return res.send(data);
    })
    .on('fail', function (data, response) {
      winston.log('error', { data: data })
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})


router.post('/remove', validateToken, function (req, res) {
  rest.post(constants.FAVORITE_API_END_POINT + 'remove?commerceId=' + req.query.commerceId + '&userId=' + req.query.userId,
    { headers: headers.traderHeader })
    .on('success', function (data, response) {
      return res.send(data);
    })
    .on('fail', function (data, response) {
      winston.log('error', { data: data })
      if (data.httpStatus) return res.status(data.httpStatus).send(data)  
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})

module.exports = router;
