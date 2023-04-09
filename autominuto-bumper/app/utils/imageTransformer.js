const moment = require('moment')
const constants   = require('../utils/constants')
const     _         = require('underscore')


  var getImageUserPath = function(userId, imageName, width, heigth) {

    if (!imageName || imageName == undefined)
      return ""
    if (imageName && imageName.includes("http")) //is Image social
        return imageName
    if ((width == undefined || width == null ) && (heigth == undefined || heigth == null))  
      return constants.PATH_IMAGES_HEROKU + 'users/' + userId + '/' + imageName

    return constants.PATH_IMAGES_HEROKU + 'users/' + userId + '/' + width + 'x' + heigth + "/" + imageName
  }


  var getImageCommercePath = function (commerceId, image, width, heigth) {
  	if (!image || image.name)
    	return ""
  	return constants.PATH_IMAGES_HEROKU + 'commerces/' + commerceId + '/' + width + 'x' + heigth + '/' + image.name
  }


  var getImageCommercePathFromName = function (commerceId, imageName, width, heigth) {
    if (imageName == undefined || !imageName)
    	return ""
    if (width && heigth)
      return constants.PATH_IMAGES_HEROKU + 'commerces/' + commerceId + '/' + width + 'x' + heigth + '/' + imageName
    return constants.PATH_IMAGES_HEROKU + 'commerces/' + commerceId + '/' + imageName
  }

  
  var getImageProductPath = function (productId, image, width, heigth) {
  	if (!image || !image.name)
		  return ""
    if (width && heigth)
      return constants.PATH_IMAGES_HEROKU + 'products/' + productId + '/' + width + 'x' + heigth + '/' + image.name
    
    return constants.PATH_IMAGES_HEROKU + 'products/' + productId + '/' + image.name
  }


  var getImageMainProductPath = function (productId, images, width, heigth) {
    for (var i = images.length - 1; i >= 0; i--) {
      if (images[i].main == true){
        return this.getImageProductPath(productId, images[i], width, heigth)      
      }
    }
  }


  var getImageProductDisk = function (service) {
    return "assets/images/categories/" + service.imageName
  }

  
  var getLinkCommerceImages= function (images, commerceId) {
    if (images == undefined || images.length == 0){
      return this.getDefaultsCommerce()
    }
    return images.map(function(image) {
      let type = ""

      for(let key in image) {
        if(key !== 'activated' && key !== 'map') { // searching others booleans
          if(image[key] === true) {
            type = key
            break
          }
        }
      }
      return { path: constants.PATH_IMAGES_HEROKU + 'commerces/' + commerceId + '/' + image.name, type: type }
    })
  }

  var getDefaultsCommerce= function(){
    let images = []
    let imageDefault = { path : '', logo : true, front: false, inside: false, streetView: false, employers: false, workStation: false}
    images.push(imageDefault)
    return images
  }


  var getCommerceLogo= function(images, commerceId) {
    if (images == undefined || images.length == 0){
      return this.getDefaultsCommerce()
    }
    return images.map(function (image) {
        image.path = constants.PATH_IMAGES_HEROKU + 'commerces/' + commerceId + '/' + image.name
        return image
    })
  }


  var getCommerceLogoFromImages= function(images, commerceId, width, heigth) {
    if (images == undefined || images.length == 0){
      return  ""
    }
    var logoImage = images.find(function (image) {
        if (image.logo){
           return image 
        }
    })
    if (!logoImage)
       return "" 
    return getImageCommercePathFromName(commerceId, logoImage.name, width, heigth)
  }

  var getCouponImagePath = function(coupon, commerceId) {
    return constants.PATH_IMAGES_HEROKU + 'coupons/' + commerceId + '/' + coupon.image
  }

module.exports = {

  getImageUserPath:getImageUserPath, 
  getImageCommercePath: getImageCommercePath,
  getImageCommercePathFromName: getImageCommercePathFromName,
  getImageProductPath: getImageProductPath,
  getImageMainProductPath: getImageMainProductPath,
  getLinkCommerceImages: getLinkCommerceImages,
  getDefaultsCommerce: getDefaultsCommerce,
  getCommerceLogo: getCommerceLogo,
  getCommerceLogoFromImages: getCommerceLogoFromImages,
  getCouponImagePath : getCouponImagePath,
  getImageProductDisk : getImageProductDisk

}

