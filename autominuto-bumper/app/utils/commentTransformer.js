const moment = require('moment')
const constants   = require('../utils/constants')
const     _         = require('underscore')
const imageTransformer   = require('../utils/imageTransformer')

var trasformer = module.exports = {

   processData: function(data) {
    let comments = data.data
    let inputFormat = "DD-MM-YYYY hh:mm"
  
    _.each(comments, function (comment) {
      comment.userFrom = trasformer.getCleanUserData(comment.userFrom)
      
      comment.commerceImageUrl = (!comment.commerceImageLogo.length) ? imageTransformer.getImageCommercePathFromName(comment.commerceId, null) : imageTransformer.getImageCommercePathFromName(comment.commerceId, comment.commerceImageLogo, 50, 50)

      if(comment.createdOn && comment.createdOn.length) {
        comment.differenceDays = getDiffDays(comment.createdOn, inputFormat)
      }

      if(comment.answer && comment.answer.createdOn) {
        comment.answer.createdOn = getDiffDays(comment.answer.createdOn, inputFormat)
      }
    })
  },

  getCleanUserData: function(userFrom) {
  	return {
		  username: userFrom.nickName || userFrom.email,
		  image: imageTransformer.getImageUserPath(userFrom.id, userFrom.imageName, 50, 50)
    }
  }
  
}

function getDiffDays(date, inputFormat) {
    let formattedDate = moment(date, inputFormat)
    return moment().diff(formattedDate, 'd')
  }
