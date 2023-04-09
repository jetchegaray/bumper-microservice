const rest          = require('restler')
const constants     = require('../utils/constants')
const express       = require('express')
const headers       = require('../utils/headers')
const winston       = require('winston')

const router = express.Router()

router.post('/receive/message', function (req, res) {
   
   var message = {
   	userNumber : req.body.contact.uid,
   	userName : req.body.contact.name,
   	createdOn : req.body.message.dtm,
   	messageId : req.body.message.uid,
   	messageCuid : req.body.message.cuid,
   	messageText : req.body.message.body.text 
   } 

   console.log(JSON.stringify(message))
    
   rest.postJson(constants.WHATSAPP_API_END_POINT + 'receive/message'
    , message, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', data)
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    
  });
})



module.exports = router;
