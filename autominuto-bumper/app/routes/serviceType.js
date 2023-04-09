const rest          = require('restler')
const constants     = require('../utils/constants')
const express       = require('express')
const headers       = require('../utils/headers')
const winston       = require('winston')
const router        = express.Router()
const fs            = require('fs')
const path          = require('path')


router.get('/all', function(req, res) {

  rest.get(constants.SERVICE_TYPE_API_END_POINT + "/all", {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })

})


router.get('/allWithDetails', function(req, res) {

  /*rest.get(constants.SERVICE_TYPE_API_END_POINT + "/topServices/quote", {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })*/ 
  fs.readFile(path.resolve(__dirname, "../data/services-details.json"), (err, json) => {
      let obj = JSON.parse(json)
      res.json(obj)
  })
})

router.get('/:serviceSlug', function(req, res) {
  rest.get(constants.SERVICE_TYPE_API_END_POINT + "/" + req.params.serviceSlug, {headers : headers.traderHeader})
    .on('success', (data) => res.send(data))
    .on('fail', (data) => res.status(data.httpStatus || 500).send(data));
});

module.exports = router;
