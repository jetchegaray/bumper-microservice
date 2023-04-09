const rest          = require('restler')
const constants     = require('../utils/constants')
const express       = require('express')
const headers       = require('../utils/headers')
const winston       = require('winston')

const router = express.Router()

router.get('/all', function(req, res) {

  rest.get(constants.COMMERCE_TYPE_API_END_POINT + "/commerce/types", {headers : headers.traderHeader})
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
