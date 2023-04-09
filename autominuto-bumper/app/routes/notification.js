var     rest      = require('restler')
const   constants = require('../utils/constants')
var	    express 	= require('express')
var     headers   = require('../utils/headers')
var     _         = require('underscore')
var     moment    = require('moment')
const winston     = require('winston')
var    imageTransformer   = require('../utils/imageTransformer')

const router      = express.Router()


router.get('/user/:userId', function (req, res) {
   rest.get(constants.NOTIFICATION_API_END_POINT + "user/" + req.params.userId, {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(processNotifications(data.data, req.params.userId))
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });


  processNotifications = (data, userId) => {
    for (var i = data.length - 1; i >= 0; i--) {
      let created = moment(data[i].createdOn, 'DD-MM-YYYY hh:mm')
      let days = moment().diff(created, "days")
      let hours = moment().diff(created, "hours")
      let minutes = moment().diff(created, "minutes")
        
      if (days > 0){
        data[i].until = "Hace " + days + " días"
      }else if (hours > 0){
        data[i].until = "Hace " + hours + " horas"  
      }else if(minutes > 0){
        data[i].until = "Hace " + minutes + " minutos"
      }
      
      if (data[i].isUserNotificacion == true) //it needs to reach out to user or to commerce
        data[i].imagePath = imageTransformer.getImageCommercePathFromName(data[i].commerceId, data[i].imageName, 50, 50) 
      else
        data[i].imagePath = imageTransformer.getImageUserPath(data[i].userId, data[i].imageName,  50, 50) 
    }
    return data
  }

})


module.exports = router;