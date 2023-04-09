var     rest                 = require('restler')
const   constants            = require('../utils/constants')
var	    express 	           = require('express')
var     headers              = require('../utils/headers')
var     _                    = require('underscore')
var     moment               = require('moment')
const   jwt                  = require('jwt-simple')
const   config               = require('../config')
const   path                 = require('path')
const   fs                   = require('fs')
const   winston              = require('winston')
const   imageTransformer     = require('../utils/imageTransformer')
const   utilWorkingHours     = require('../utils/workingHours')
const   multiparty           = require('connect-multiparty')
const   multipartyMiddleware = multiparty()
const   {validateToken}      = require('../utils/authMiddleware')
const   clientS3             = require('../utils/autominuto-s3')
const   phoneUtils           = require('../utils/phones')

const router      = express.Router();


router.post('/save', multipartyMiddleware, function(req, res) {

  let keyImages = []
  let imageFiles = []
  let dataFiles = [] // for s3


  if (req.files && req.files.files){
    imageFiles = req.files.files
    keyImages = generateKeys(imageFiles)
  }

  const quote = JSON.parse(req.body.quote)
  quote.imagesNames = keyImages

  rest.postJson(constants.QUOTE_API_END_POINT + 'save/requests?userId=' + req.query.userId, quote, {headers : headers.traderHeader})
    .on('success', function(dataTrader, response){

      if(imageFiles.length) {
          imageFiles.forEach(function (file, index) {
            dataFiles.push({
              key: 'quotes/' + dataTrader.result + '/' + keyImages[index],
              stream: fs.createReadStream(file.path)
            })
          })
          dataFiles.forEach(function(data) {
            console.log("file  a salvar en S3: ", data.key)
          })

          return clientS3.putBatch(dataFiles)
            .then(function(data) {
              return res.send(dataTrader)
          })
          .catch(function(data) {
              return res.send(data)
          })
      } else {
        return res.send(dataTrader)
      }

      res.send(dataTrader)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })
})




router.post('/save/fleet', multipartyMiddleware, function(req, res) {

  let keyImages = []
  let imageFiles = []
  let dataFiles = [] // for s3


  if (req.files && req.files.files){
    imageFiles = req.files.files
    keyImages = generateKeys(imageFiles)
  }
  const quote = req.body.quote
  quote.imagesNames = keyImages

  rest.postJson(constants.QUOTE_API_END_POINT + 'save/requests/fleet?userId=' + req.query.userId, quote, {headers : headers.traderHeader})
    .on('success', function(dataTrader, response){

      if(imageFiles.length) {
          imageFiles.forEach(function (file, index) {
            dataFiles.push({
              key: 'quotes/' + dataTrader.result + '/' + keyImages[index],
              stream: fs.createReadStream(file.path)
            })
          })
          dataFiles.forEach(function(data) {
            console.log("file  a salvar en S3: ", data.key)
          })

          return clientS3.putBatch(dataFiles)
            .then(function(data) {
              return res.send(dataTrader)
          })
          .catch(function(data) {
              return res.send(data)
          })
      } else {
        return res.send(dataTrader)
      }

      res.send(dataTrader)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })
})



router.post('/save/appointment', multipartyMiddleware, function(req, res) {
  let keyImages = []
  let imageFiles = []
  let dataFiles = [] // for s3

  if (req.files && req.files.files){
    imageFiles = req.files.files
    keyImages = generateKeys(imageFiles)
  }

  const quoteData = JSON.parse(req.body.quoteData)
  quoteData.quote.imagesNames = keyImages

  rest.postJson(constants.QUOTE_API_END_POINT + 'save/request?commerceId=' + req.query.commerceId, quoteData, {headers : headers.traderHeader})
    .on('success', function(dataTrader, response){

       if(imageFiles.length) {
          imageFiles.forEach(function (file, index) {
            dataFiles.push({
              key: 'quotes/' + dataTrader.quoteId + '/' + keyImages[index],
              stream: fs.createReadStream(file.path)
            })
          })
          dataFiles.forEach(function(data) {
            console.log("file  a salvar en S3: ", data.key)
          })

          return clientS3.putBatch(dataFiles)
            .then(function(data) {
                return res.send({
                    token: createJWT(dataTrader.user),
                    userId: dataTrader.user.id,
                    nickName: dataTrader.user.nickName,
                    email: dataTrader.user.email,
                    lastLogin: dataTrader.user.lastLogin,
                    quoteId: dataTrader.quoteId,
                    hasCommerce: false,
                    activated: false,
                })
          })
          .catch(function(data) {
              return res.send(data)
          })
      } else {

        return res.send({
          token: createJWT(dataTrader.user),
          userId: dataTrader.user.id,
          nickName: dataTrader.user.nickName,
          email: dataTrader.user.email,
          lastLogin: dataTrader.user.lastLogin,
          quoteId: dataTrader.quoteId,
          hasCommerce: false,
          activated: false,
        })
      }

      return res.send({
        token: createJWT(dataTrader.user),
        userId: dataTrader.user.id,
        nickName: dataTrader.user.nickName,
        email: dataTrader.user.email,
        lastLogin: dataTrader.user.lastLogin,
        quoteId: dataTrader.quoteId,
        hasCommerce: false,
        activated: false,
      })

    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  })
})


function minNumber(array) {
  if (array.length === 0) return 0
  let min = array[0].price
  for (let i = 0; i < array.length; i++) {
    if (array[i] < array[min]) min = i
  }
  return min
}



function createJWT(user) {
  var payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(constants.MAX_DAYS, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}


router.post('/:idQuote/replies', multipartyMiddleware, function(req, res) {
 // let replyData = req.body.replyData
  const commerceId = req.query.commerceId
  const {replies, serviceType, services, saveThemAtStore} = JSON.parse(req.body.data)
  let images = []
  let keyImages = []
  let imageFiles = []

  if (req.files && req.files.files){
    imageFiles = req.files.files
    keyImages = generateKeys(imageFiles)
  }

  const products = services.map(({name, temporaryBrand, code, price, description}, index) => {

    if (keyImages.length) {
      images = [{name: keyImages[index], main: true}]
    }

    return {name, temporaryBrand, code, price, description, images, service: false}
  })

  let serviceTypeId = serviceType.id

  rest.postJson(constants.QUOTE_API_END_POINT + req.params.idQuote + '/replies?commerceId=' + commerceId, {replies, serviceTypeId, products, saveThemAtStore}, {headers : headers.traderHeader})
    .on('success', function(data, response){

       if (keyImages.length) {
          Promise.all(
              data.result.split(',').map((productId, index) => {
                return clientS3.putBatch([{
                  key: 'products/' + productId + '/' + keyImages[index], stream: fs.createReadStream(imageFiles[index].path)
                }])
              })
          )
          .then(() => res.send(data))
          .catch(error => res.status(500).send({error}))
        }

      res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  })
})


const generateKeys = (files) => {
  return files.map(function(file) {
    let extension = file.type.split("/")[1]
    return generateKey(file.name, extension)
  })
}


const generateKey = (fileName, extension) => {
  const timestamp = (new Date()).getTime()
  return require('crypto').createHash('md5').update(fileName + timestamp).digest("hex") + "." + extension.toLowerCase()
}

router.post('/:idQuote/reply', function(req, res) {
  var {reply, product} = JSON.parse(req.body.data)

  let files = req.files && req.files.files || []
  let dataFiles = [] // for s3

  let images = (product && product.images != undefined && images.length > 0) ? data.product.images : [] // for server

  images = cleanImageNames(images)
  let imageKeys = generateKeys(files)

  imageKeys.forEach(function(key) {
    images = []
    images.push({
      name: key,
      main: true // for now
    })
  })
  if (product){
    product.images = images
    product.serviceTypeId = product.serviceType.id
    //delete product.serviceType
  }

  rest.postJson(constants.QUOTE_API_END_POINT + req.params.idQuote + '/reply?commerceId=' + req.query.commerceId, {reply, product, saveItAtStore : true}, {headers : headers.traderHeader})
    .on('success', function(data, response){

      if (product){
        let productId = data.result || product.serviceTypeId //TODO: consultar Javier, antes estaba product.id y no existía
        product.id = productId

        completeProductImages([product])
        if(files.length) {
          files.forEach(function (file, index) {
            dataFiles.push({
              key: 'products/' + productId + '/' + imageKeys[index],
              stream: fs.createReadStream(file.path)
            })
          })
          dataFiles.forEach(function(data) {
            console.log("file  a salvar en S3: ", data.key)
          })

          return clientS3.putBatch(dataFiles)
            .then(function(data) {
              return res.send({ product: product })
            })
            .catch(function(data) {
              return res.send(data)
            })

        } else {
          return res.send({ product: product })
        }
      } else {
        return res.send({ product: product })
      }


    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  })

  function cleanImageNames(images) {
    if(!images) return []

    return images.map(image => {
      let name = image.name
      let posSeparator = name.lastIndexOf('/') + 1

      return {
        name: name.substring(posSeparator),
        main: image.main
      }
    })
  }

  function generateKeys(files) {
    return files.map(function(file) {
      return generateKey(file.name)
    })
  }

})

router.post('/:idQuote/refuse', function(req, res) {
  var reply = req.body.replyData
  let product = {}
 
  rest.postJson(constants.QUOTE_API_END_POINT + req.params.idQuote + '/reply?commerceId=' + req.query.commerceId, {reply, product, saveItAtStore : true}, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  })
})

router.get('/:idQuote/rating', function(req, res) {
  rest.get(constants.QUOTE_API_END_POINT + req.params.idQuote, {headers : headers.traderHeader})
    .on('success', function(data, response){
      data.commerceImages = imageTransformer.getCommerceLogo(data.commerce.images, data.commerce.id)

      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });

});


router.get('/:idQuote/has/rating', function(req, res) {
  rest.get(constants.QUOTE_API_END_POINT + req.params.idQuote + '/has/rating?userId=' + req.query.userId + '&commerceId=' + req.query.commerceId, {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
});


router.post('/:idQuote/rating/save', function(req, res) {
 let ratingData = req.body.rating

 rest.postJson(constants.QUOTE_API_END_POINT + req.params.idQuote + '/rating/save?userId=' + req.query.userId + '&commerceId=' + req.query.commerceId, ratingData, {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
});

//to change a status of the quote, It's called from board/user/quotes
//under certain actions of the user
// status could be requested,accepted,refused,finished, qualified

router.post('/:idQuote/status/:replyId', function(req, res) {
  let requestStatus = {status: req.body.requestStatus}
  let commerceId = req.query.commerceId
  let urlToCall
  if(commerceId){
    urlToCall = constants.QUOTE_API_END_POINT + req.params.idQuote + '/status/'+ req.params.replyId +'?commerceId=' + commerceId
  } else {
    urlToCall = constants.QUOTE_API_END_POINT + req.params.idQuote + '/status/' + req.params.replyId
  }

  rest.postJson( urlToCall, requestStatus, {headers : headers.traderHeader})
    .on('success', function(data, response){
      res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });

});



router.get('/commerce/:commerceId/:status', function(req, res) {
  let commerceId = req.params.commerceId
  let status = req.params.status

  let page = req.query.page
  let userQuotes = [], filters
  let lastLogin = req.query.lastLogin
  let formatDate = "DD-MM-YYYY hh:mm"
  let formatOutput = "DD-MM-YYYY hh:mm"
  let newQuotes = 0

  if(!commerceId || !status || !page) return res.status(400).send("Missing parameters: commerceId or status or page.")

  let requestData = {
      commerceId : commerceId,
      status: status,
      page: page,
      lastView: moment().format(formatOutput)
  };

  rest.postJson(constants.QUOTE_API_END_POINT + 'commerce/all', requestData, {headers : headers.traderHeader})
    .on('success', function(data) {
      processQuotes(data.data)
      let totalPages = Math.ceil(data.total / data.perPages)
      res.send({ userQuotes: userQuotes, filters: data.filters, newQuotes: newQuotes, totalPages: totalPages, filterToShow: 'budgets' })
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })

  function processQuotes(quotesCommerce) {

    _.each(quotesCommerce, function(quote) {
      let item = {}

      item.userFrom = getUserData(quote)
      item.createdOn = (quote.createdOn) ? moment(quote.createdOn, formatDate).format(formatOutput) : ""
      item.possibleAppointments = quote.possibleAppointments
      item.quoteId = quote.id
      item.status = quote.status
      item.quoteType = quote.quoteType
      item.issue = getIssueData(quote)
      item.serviceType = quote.serviceTypes[0]
      item.modelCar = getBrandData(quote.brand, quote.chasisNumber, quote.carYear)
      item.replies = getReply(quote.replies)
      item.location = quote.location
      item.explanations = quote.explanations

      updateNotifications(quote.createdOn, quote.status)
    //  updateFilters(filters, quote)

      userQuotes.push(item)
    })

  }

  function updateFilters(filters, quote) {
    let reply = quote.replies[0]

    if(quote.status === "finished" || quote.status === "qualified") {
      filters[quote.status]++
      return
    }
    if(reply.status === "requested" || reply.status === "replied" || reply.status === "refused") {
      filters[reply.status]++
    }
  }

  function updateNotifications(createdOn, status) {
    if(createdOn && status === "requested") {
      let createdQuote = moment(createdOn, formatDate)
      lastLogin = moment(lastLogin, formatDate)

      if(createdQuote > lastLogin) newQuotes++
    }
  }

  function getReply (replies) {

     _.each(replies, function(reply){

      reply.status = reply.status
      reply.comment = reply.comment || ""
      reply.cost = reply.cost || ""
      reply.freeService = reply.freeService

      commerce = {}
      commerce.id = reply.commerce.id
      commerce.name = reply.commerce.name
      commerce.logo =  getCommerceImageLogo(reply.commerce.id, reply.commerce.images)
      commerce.workingTime = reply.commerce.workingTime
      commerce.workingHours = (reply.commerce.workingHours !== null && reply.commerce.workingHours !== undefined && reply.commerce.workingHours.periods !== undefined && reply.commerce.workingHours.periods !== null && reply.commerce.workingHours.periods.length > 0) ? utilWorkingHours.parseWorkingHours(reply.commerce.workingHours) : null,
      commerce.paymentMethods = getPaymentMethods(reply.commerce.paymentMethods)
      reply.commerce = commerce;
      reply.createdOn = (reply.createdOn) ? moment(reply.createdOn, formatDate).format(formatOutput) : ""
      reply.possibleAppointments = reply.possibleAppointments
      reply.id = reply.id
      reply.productId = reply.productId
    })
    return replies
   }
})




router.get('/user/:userId/:status', function(req, res) {

  let userId = req.params.userId
  let status = req.params.status

  let page = req.query.page
  let userQuotes = [], filters
  var lastLogin = req.query.lastLogin
  let formatDate = "DD-MM-YYYY hh:mm"
  let formatOutput = "DD-MM-YYYY hh:mm"
  let newQuotes = 0

  if(!userId || !status || !page) return res.status(400).send("Missing parameters: userId or status or page.")

  rest.get(constants.QUOTE_API_END_POINT + 'user/' + userId + '/' + status + '?page=' + page, {headers : headers.traderHeader})
    .on('success', function(data) {
      processQuotes(data.data)
      let totalPages = Math.ceil(data.total / data.perPages)
      res.send({ userQuotes: userQuotes, filters: filters, newQuotes: newQuotes, totalPages: totalPages, filterToShow: 'budgets' })
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })

  function processQuotes(quotesCommerce) {

    _.each(quotesCommerce, function(quote) {
      let item = {}

      item.userFrom = getUserData(quote)
      item.createdOn = (quote.createdOn) ? moment(quote.createdOn, formatDate).format(formatOutput) : ""
      item.possibleAppointments = quote.possibleAppointments
      item.quoteId = quote.id
      item.status = quote.status
      item.quoteType = quote.quoteType
      item.issue = getIssueData(quote)
      item.serviceType = quote.serviceTypes[0]
      item.modelCar = getBrandData(quote.brand, quote.chasisNumber, quote.carYear)
      item.replies = getReplies(quote.replies)
      item.location = quote.location
      item.explanations = quote.explanations

      updateNotifications(quote.createdOn, quote.status)
    //  updateFilters(filters, quote)

      userQuotes.push(item)
    })

  }

  function updateNotifications(createdOn, status) {
    if(createdOn && status === "requested") {
      let createdQuote = moment(createdOn, formatDate)
      lastLogin = moment(lastLogin, formatDate)

      if(createdQuote > lastLogin) newQuotes++
    }
  }

  function getReplies(replies) {

    _.each(replies, function(reply){

      reply.status = reply.status
      reply.comment = reply.comment || ""
      reply.cost = reply.cost || ""
      reply.freeService = reply.freeService

      commerce = {}
      commerce.id = reply.commerce.id
      commerce.name = reply.commerce.name
      commerce.logo =  getCommerceImageLogo(reply.commerce.id, reply.commerce.images)
      commerce.workingTime = reply.commerce.workingTime
      commerce.workingHours = (reply.commerce.workingHours !== null && reply.commerce.workingHours !== undefined && reply.commerce.workingHours.periods !== undefined && reply.commerce.workingHours.periods !== null && reply.commerce.workingHours.periods.length > 0) ? utilWorkingHours.parseWorkingHours(reply.commerce.workingHours) : null,
      commerce.paymentMethods = getPaymentMethods(reply.commerce.paymentMethods)
      if (reply.status === 'accepted_user') {
        commerce.location = reply.commerce.location;
      }
      commerce.phones = phoneUtils.formatPhones(reply.commerce.phones);
      commerce.deliveryMechanic = reply.commerce.deliveryMechanic
      
      reply.commerce = commerce;
      reply.createdOn = (reply.createdOn) ? moment(reply.createdOn, formatDate).format(formatOutput) : ""
      reply.possibleAppointments = reply.possibleAppointments
      reply.id = reply.id
      reply.productId = reply.productId
    })
    return replies
  }
})

getCommerceImageLogo = function(commerceId, images) {
  for(let index = 0; index < images.length; index++) {
    if(images[index].logo) {
      return imageTransformer.getImageCommercePathFromName(commerceId, images[index].name, 90, 90)
    }
  }
  return ""
}

getPaymentMethods = function(paymentMethods) {
  let paymentMethodsLabel = "Métodos de pago: "
  if (paymentMethods){
    if (paymentMethods.cash) {
      paymentMethodsLabel += "Efectivo"
    }
    if (paymentMethods.debit) {
      paymentMethodsLabel += ", Debito"
    }
    if (paymentMethods.credit) {
      paymentMethodsLabel += ", Credito"
    }
    if (paymentMethods.transfer) {
      paymentMethodsLabel += ", Transferencia"
    }
    if (!paymentMethods.cash && !paymentMethods.debit && !paymentMethods.credit && !paymentMethods.transfer) {
      paymentMethodsLabel = '';
    }

    let promotionLabel = ""
    if (paymentMethods.promotions && paymentMethods.promotions.length){
      _.forEach(paymentMethods.promotions, (promotion) => {
          if (promotion.installments && promotion.installments != undefined && promotion.installments != null){
              promotionLabel = promotion.installments + " cuotas"

              if (promotion.card != undefined && promotion.card == "todas"){
                promotionLabel += " con todas las tarjetas"
              } else {
                  promotionLabel += " con "+promotion.card
              }
              if (promotion.interest && promotion.interest != undefined && promotion.interest != null){
                  promotionLabel += ", "+promotion.interest+" % interés"
              }else{
                  promotionLabel += " sin interés"
              }
          }
      })

    }

    return {
      label: paymentMethodsLabel,
      promotions: promotionLabel
    }
  }
  return null
}

getUserData = function(quote) {
  return {
    id : quote.userFrom.id,
    username: quote.userFrom.nickName || quote.userFrom.email.split('@')[0],
    userPhoto: imageTransformer.getImageUserPath(quote.userFrom.id, quote.userFrom.imageName, 80, 80)
  }
}

getIssueData = function(quote) {
  let service = quote.serviceTypes[0]
  quote.serviceTypeDetail = (quote.serviceTypeDetail) ? quote.serviceTypeDetail.replace(/:true/gi, '').replace(/: true/gi, '').split(',').filter(v=>v!='').join(' - ') : ''
  return {
    name: service.aliasUser,
    detailIssue: quote.serviceTypeDetail,
    image : service.imageName,
    product: service.service == false,
    quoteable: service.quoteable,
  }
}


getBrandData = function(brand, chasisNumber, carYear) {
  let modelCar = {
    brandName: "",
    subBrandName: "",
    chasisNumber : chasisNumber,
    carYear: carYear
  }

  if(brand) {
    modelCar.brandName = brand.name || ""

    let subBrands = brand.subbrands

    if(subBrands && subBrands.length) {
      modelCar.subBrandName = subBrands[0].name || ""
    }
  }
  return modelCar
}



router.get('/ratings/commerce/:commerceId', function(req, res) {
  let commerceId = req.params.commerceId

  let page = req.query.page
  let ratingCommerce = [], filters
  let formatDate = "DD-MM-YYYY hh:mm"
  let formatOutput = "DD-MM-YYYY hh:mm"
  let newQuotes = 0

  if(!commerceId || !page) return res.status(400).send("Missing parameters: commerceId or page.")

  rest.get(constants.QUOTE_API_END_POINT + 'ratings/commerce/' + commerceId + '?page=' + page, {headers : headers.traderHeader})
    .on('success', function(data) {
      processRatings(data.data)
      let totalPages = Math.ceil(data.total / data.perPages)
      res.send({ userQuotes : ratingCommerce, filters: filters, newQuotes: newQuotes, totalPages: totalPages, filterToShow: 'qualified' })
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })

  function processRatings(ratingQuoteOrder) {

    _.each(ratingQuoteOrder, function(rating) {
      let item = {}


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

router.post('/withRegistration', function (req, res) {
  rest.postJson(constants.QUOTE_API_END_POINT + 'save/requests/user', req.body, { headers: headers.traderHeader })
    .on('success', (data) => {
    
        return res.send({
          token: createJWT(data.user),
          userId: data.user.id,
          nickName: data.user.nickName,
          email: data.user.email,
          lastLogin: data.user.lastLogin,
          quoteId: data.quoteId,
          hasCommerce: false,
          activated: false
        })

    })
    .on('fail', (data, response) => {
      res.status(data.httpStatus || 500).send(data)
    });
});

module.exports = router;

// add the real path of the images of each product, and select the first image
// with the field 'main' in true as the main image
function completeProductImages(products) {
  products.forEach(function (product) {
    let images = (product.images && product.images.length) ? product.images : []

    images.forEach(function(image) {
      imageName = imageTransformer.getImageProductPath(product.id, image, 180, 200)

      if(imageName && !product.mainImage) {
        product.mainImage = imageName
      }
    })
    // case: product.images is null or is empty or doesnt exists main image
    product.mainImage = product.mainImage || constants.CATEGORIES_IMAGE_ROUTE + product.serviceType.imageName
  })
}

