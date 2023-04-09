const rest          = require('restler')
const constants     = require('../utils/constants')
const express       = require('express')
const headers       = require('../utils/headers')
const winston       = require('winston')
const _             = require('underscore')

const router = express.Router()

router.post('/:commentId/saveAnswerCommerce', function (req, res) {
  
  rest.postJson(constants.COMMENT_API_END_POINT + req.params.commentId + '/saveAnswerCommerce'
    , {comment: req.body.answer}, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(processData(data));
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    
  })

  function processData(data) {
    let comments = data.data
    let inputFormat = "DD-MM-YYYY hh:mm"

    _.each(comments, function (comment) {
      comment.userFrom = getCleanUserData(comment.userFrom)

      comment.commerceImageUrl = (comment.commerceImageLogo != null && comment.commerceImageLogo.length > 0) ? imageTransformer.getImageCommercePathFromName(req.params.commerceId, comment.commerceImageLogo, 50, 50) : imageTransformer.getImageCommercePathFromName(req.params.commerceId, null)

      if(comment.createdOn && comment.createdOn.length) {
        comment.differenceDays = getDiffDays(comment.createdOn, inputFormat)
      }

      if(comment.answer && comment.answer.createdOn) {
        comment.answer.createdOn = getDiffDays(comment.answer.createdOn, inputFormat)
      }
    })
  }

  function getCleanUserData(userFrom) {
    return {
      username: userFrom.nickName || userFrom.email,
      image: imageTransformer.getImageUserPath(userFrom.id, userFrom.imageName, 50, 50)
    }
  }

  function getDiffDays(date, inputFormat) {
    let formattedDate = moment(date, inputFormat)
    return moment().diff(formattedDate, 'd')
  }  
})


router.post('/:commentId/saveAnswerProduct', function (req, res) {
  
  rest.postJson(constants.COMMENT_API_END_POINT + req.params.productId + '/saveAnswerProduct'
    , {comment: req.body.answer}, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})



module.exports = router;
