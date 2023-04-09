var     rest      = require('restler')
const   constants = require('../utils/constants')
var	    express 	= require('express')
var     headers   = require('../utils/headers')
var     _         = require('underscore')
var     moment    = require('moment')
const winston     = require('winston')
const {validateToken} = require('../utils/authMiddleware')
const router      = express.Router()


router.post('/save', validateToken, function (req, res) {
  rest.postJson(constants.RECOMMENDATION_API_END_POINT + '/save/?commerceId=' + req.query.commerceId + '&userId=' + req.query.userId, req.body.recommendation , {headers: headers.traderHeader})
    .on('success', function(data, response) {
      res.send(data)
    })
    .on('fail', function(data, response) {
		winston.log('error', {data: data})
  	if (data.httpStatus) return res.status(data.httpStatus).send(data)
		if (response.status) return res.status(response.status).send(data)
		return res.status(500).send(data)
    })
})


module.exports = router;