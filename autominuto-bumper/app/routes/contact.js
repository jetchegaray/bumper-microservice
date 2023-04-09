const rest      = require('restler')
const constants = require('../utils/constants')
const express   = require('express')
const headers   = require('../utils/headers')
const winston   = require('winston')

const router = express.Router()

router.post('/suscribeNewsletter', (req, res) => {

  const email = req.body.email

  if (email === undefined || email === 'undefined' || validate(email) == false) {
    return res.status(400).send({data : {message: 'El email ingresado es inválido'}})
  }

  rest.postJson(constants.CONTACT_API_END_POINT + 'subscription/newsletter', {"email" : email}, {headers: headers.traderHeader})
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


  function validate(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
      return (true)
    }
    return (false)
  }
})


router.post('/autominuto', (req, res) => {

  const email = req.body.email

  const contactRequest = {
    mail : email,
    name : req.body.name,
    phone : req.body.phone
  }

  if (email === undefined || email === 'undefined' || validate(email) == false) {
    return res.status(400).send({data : {message: 'El email ingresado es inválido'}})
  }

  rest.postJson(constants.CONTACT_API_END_POINT + 'autominuto', contactRequest, {headers: headers.traderHeader})
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


  function validate(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
      return (true)
    }
    return (false)
  }
})

module.exports = router