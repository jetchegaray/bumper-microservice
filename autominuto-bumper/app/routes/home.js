const imageTransformer  = require('../utils/imageTransformer')
const rest 			        = require('restler')
const constants         = require('../utils/constants')
const express 		      = require('express')
const _                 = require('underscore')
const headers           = require('../utils/headers')
const winston           = require('winston')
var   moment            = require('moment')
const couponTransformer = require('../utils/couponTransformer')
const fs                = require('fs')
const path              = require('path')
const router            = express.Router();


router.get('/topCommerces', function(req, res) {
	 

   rest.get(constants.HOME_API_END_POINT + 'topGarageCommerces', {headers : headers.traderHeader})
	 .on('success', function(data, response){

        if(data && data.length > 0){
          _.map(data, function(comerce) {
            comerce.images = imageTransformer.getCommerceLogo(comerce.images, comerce.id);
          });
        }

       return res.send(data);
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);    
     });
//    return res.send([]); 
})


router.get('/topOfficialBrandsCommerces', function(req, res) {
   return res.send([]); 
   rest.get(constants.HOME_API_END_POINT + 'topOfficialBrandsCommerces', {headers : headers.traderHeader})
	 .on('success', function(data, response){

      if(data && data.length > 0){
        _.map(data, function(brand) {
          brand.imageName = constants.BRANDS_IMAGES_LOGO_ROUTE + brand.imageName;
        });
      }

      return res.send(data);
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);     
     })
})


router.get('/topAddressQuotes', function(req, res) {
  var userId = req.query.userId;

  rest.get(constants.HOME_API_END_POINT + 'topAddressQuotes?idUser=' + userId, {headers : headers.traderHeader})
   .on('success', function(data, response){
  	 	 return res.send(data);
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data); 
     })
})


router.get('/lastBetterRatings', function(req, res) {
   let ratingCommerce = []
   return res.send([]);
	
  	rest.get(constants.HOME_API_END_POINT + 'lastBetterRatings', {headers : headers.traderHeader})
		.on('success', function(data, response){

        processRatings(data)
        ratingCommerce = (ratingCommerce.length <= 3) ? [] : ratingCommerce
        return res.send(ratingCommerce)
		}).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
		})



    function processRatings(ratingQuoteOrder) {

      _.each(ratingQuoteOrder, function(rating) {
        let item = {}
        let formatDate = "DD-MM-YYYY hh:mm:ss"
        let formatOutput = "DD-MM-YYYY hh:mm"
  

        item.userFrom = getUserData(rating)
        item.createdOn = (rating.createdOn) ? moment(rating.createdOn, formatDate).format(formatOutput) : ""
        item.stars = rating.stars
        item.comment = rating.comment
        item.isQuote = rating.isQuote
        item.name = rating.name
        item.description = rating.description
      // updateNotifications(quote.createdOn, quote.status)
      //  updateFilters(filters, quote)

        ratingCommerce.push(item)
      })
    }

    function getUserData(rating) {
      return {
        id : rating.user.id,
        username: rating.user.nickName || rating.user.email,
        userPhoto: imageTransformer.getImageUserPath(rating.user.id, rating.user.imageName, 80, 80)
      }
  }
})


router.get('/classifiedBrands', function(req, res) {

  fs.readFile(path.resolve(__dirname, "../data/brands-classified.json"), (err, json) => {
      let obj = JSON.parse(json)
      res.json(obj)
  }) 
  /*
  rest.get(constants.HOME_API_END_POINT + 'brands', {headers : headers.traderHeader})
    .on('success', function(data, response) {
      let serviceBrands = []
      let autoPartsBrand = []

      _.forEach(data, function (brand) {
        brand.imageNameLogo = constants.BRANDS_IMAGES_LOGO_ROUTE + brand.imageName;
        brand.imageName = constants.BRANDS_IMAGES_ISOLOGO_ROUTE + brand.imageName;
        
        brand.official = false

        if (brand.sparePart === true) {
          autoPartsBrand.push(brand)
        } else {
          serviceBrands.push(brand)
        }
        })

        return res.send({serviceBrands: serviceBrands, autoPartsBrand: autoPartsBrand})

    }).on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
    */
    
})


router.get('/searchBrands', function(req, res) {

  rest.get(constants.HOME_API_END_POINT + 'brands', {headers : headers.traderHeader})
   .on('success', function(data, response){
      let brands = _.chain(data).filter(function(elem) {return elem.sparePart === false}).map(function(elem) { return { value: elem.id, label: elem.name, slug : elem.slug} }).value()
      return res.send(brands);
   }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
   })
})


router.get('/topServicesSpareParts', function(req, res) {

	 rest.get(constants.HOME_API_END_POINT + 'topServicesSpareParts', {headers : headers.traderHeader})
	 .on('success', function(data, response) {
     return res.send(data);
   }).on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
   })
})


router.get('/topCoupons', function(req, res) {
   
   rest.get(constants.HOME_API_END_POINT + 'topCoupons?limitDefault='+ 4, {headers : headers.traderHeader})
   .on('success', function(data, response){
      let coupons = data
      if(coupons.length) {
        coupons.forEach(function (coupon) {
          couponTransformer.addExtraInformationToCouponSummary(coupon, coupon.commerceId)
        })
      }
      return res.send(coupons);
     }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);    
     });
})


module.exports = router;
