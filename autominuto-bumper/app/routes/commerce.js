const rest                  = require('restler')
const path                  = require('path')
const fs                    = require('fs')
const constants             = require('../utils/constants')
const express               = require('express')
const headers               = require('../utils/headers')
const winston               = require('winston')
const moment                = require('moment')
const jwt                   = require('jwt-simple')
const config                = require('../config')
const _                     = require('underscore')
const multiparty            = require('connect-multiparty')
const multipartyMiddleware  = multiparty()
const clientS3              = require('../utils/autominuto-s3')
const imageTransformer      = require('../utils/imageTransformer')
const commerceService       = require('../service/commerceService')
const {validateToken}       = require('../utils/authMiddleware')
const couponTransformer     = require('../utils/couponTransformer')
const utilPhones            = require('../utils/phones')

const router = express.Router()

// used in addCommerce - validateCommerce and tab perfil from dashboard commerce
router.get('/getCommerceData/:commerceId', function(req, res) {
  const commerceId = req.params.commerceId
  rest.get(constants.COMMERCE_API_END_POINT + "find/" + commerceId, {headers : headers.traderHeader})
    .on('success', function(data, response){
      if (data.workingHours != null && data.workingHours != undefined){
        data.workingHours.periods = buildWorkingHours(data.workingHours.periods)
        data.selectedDays = buildSelectedDays(data.workingHours.periods)
      }
      data.phones = utilPhones.formatPhones(data.phones)
      data.imageData = imageTransformer.getLinkCommerceImages(data.images, commerceId)
      res.send(data)
    })
    .on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    });


  function buildSelectedDays(workingHours) {
    let selectedDays = {
      lu: { value: false, pos: null }, ma: { value: false, pos: null }, mi: { value: false, pos: null }, ju: { value: false, pos: null },
      vi: { value: false, pos: null }, sa: { value: false, pos: null }, do: { value: false, pos: null }, fe: { value: false, pos: null }
    }

    _.each(workingHours, function(workingHour, index) {
      for(let key in workingHour.dias) {
        if(workingHour.dias[key] === true) {
          selectedDays[key].value = true
          selectedDays[key].pos = index
        }
      }
    })

    return selectedDays
  }

  function buildWorkingHours(periods) {
    let groupDays = _.groupBy(periods, 'openDay')
    let workingTimes = buildWorkingTimes(groupDays)
    return formatWorkingTime(workingTimes)
  }

  function formatWorkingTime(workingTimes) {
    let keys = {1: 'lu', 2: 'ma', 3: 'mi', 4: 'ju', 5: 'vi', 6: 'sa', 7: 'do', 8: 'fe'}
    let workingHours = []

    _.forEach(workingTimes, function(workingTime) {
      let schedule = []
      let days = { lu: false, ma: false, mi: false, ju: false, vi: false, sa: false, do: false, fe: false }

      _.each(workingTime, function(workingDay, index) {
        if(index === 0) {
          _.forEach(workingDay, function(workingHour) {
            let openHour = workingHour.openHour
            openHour = openHour.split(":")
            let open = new Date(1970, 0, 1, openHour[0], openHour[1], 0, 0)
            let closeHour = workingHour.closeHour
            closeHour = closeHour.split(":")
            let close = new Date(1970, 0, 1, closeHour[0], closeHour[1], 0, 0)
            schedule.push({ open: open.getTime(), close: close.getTime(), openHourTime : workingHour.openHourTime, closeHourTime : workingHour.closeHourTime })
          })
        }
        days[keys[workingDay[0].openDay]] = true
      })

      workingHours.push({ dias: days, horario: schedule })
    })

    return workingHours
  }

  function buildWorkingTimes(groupDays) {
    let workingTimes = []
    let subGroupDays = []
    for(let key in groupDays) { subGroupDays.push(groupDays[key]) }

    _.forEach(subGroupDays, function(aGroupDay) {
      let indexWorkingTimes = getIndexInWorkingTimes(aGroupDay, workingTimes)
      if(indexWorkingTimes !== -1) {
        workingTimes[indexWorkingTimes].push(aGroupDay)
      } else {
        workingTimes.push([aGroupDay])
      }
    })
    return workingTimes;
  }

  function getIndexInWorkingTimes(groupDay, workingTimes) {
    let added = false
    let indexWorkingTimes = 0

    while(!added && indexWorkingTimes < workingTimes.length) {
      let workingTime = workingTimes[indexWorkingTimes][0]
      if(compareTo(groupDay, workingTime)) { return indexWorkingTimes }
      indexWorkingTimes++
    }
    return -1
  }

  function compareTo(groupDay, workingTime) {
    if(groupDay.length !== workingTime.length) { return false }

    let groupHours = _.map(groupDay, function(element) { return element.openHour + "-" + element.closeHour })
    let workingHours = _.map(workingTime, function(element) { return element.openHour + "-" + element.closeHour })

    for(let indexWorkingHours = 0; indexWorkingHours < workingHours.length; indexWorkingHours++) {
      let found = false
      for(let indexGroupHours = 0; indexGroupHours < groupHours.length; indexGroupHours++) {
        if(groupHours[indexGroupHours] === workingHours[indexWorkingHours]) {
          found = true
          break
        }
      }
      if(!found) { return false; }
    }
    return true;
  }
});

router.get('/:commerceId/rating/recommendation', function(req, res) {
  rest.get(constants.COMMERCE_API_END_POINT + req.params.commerceId + "/rating/recommendation", {headers : headers.traderHeader})
    .on('success', function(data, response){

      let recommendations = data.data
      recommendations.forEach(function(item) {
        if(item.stars !== undefined) {
          let integer = Math.floor(item.stars)
          item.stars = (item.stars - integer > 0.5) ? integer + 0.5 : integer
        }
        item.user.pathImage = imageTransformer.getImageUserPath(item.user.id, item.user.imageName)
      })

      res.send(data)
    })
    .on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
if (response.status) return res.status(response.status).send(data)
return res.status(500).send(data)
    });
})

router.get('/find/:commerceId', function(req, res) {
  const commerceId = req.params.commerceId

  commerceService.findByCommerceId(commerceId)
    .then(result => res.send(result))
    .catch(({data, response}) => {
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})


router.get('/find/details/:commerceId', function(req, res) {
  const commerceId = req.params.commerceId

  commerceService.findByCommerceId(commerceId)
    .then(result => {
     
      rest.get(constants.SERVICE_TYPE_API_END_POINT + "/topServices/quote", {headers : headers.traderHeader})
      .on('success', function(data, response){
          result.services = _.filter(data, function(serviceType){ 
            return _.some(result.services, 
               serviceTypeCommerce => serviceTypeCommerce.id == serviceType.id )
          })
        return res.send(result)
      
      }).on('fail', function(data, response){
        winston.log('error', {data: data})  
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
      })

    })
    .catch(({data, response}) => {
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.get('/find/:commerceId/owner', function(req, res) {
  const commerceId = req.params.commerceId
  const userId = req.query.userId 
  commerceService.findByCommerceIdOwner(commerceId, userId)
    .then(result => res.send(result))
     //YES commerce object if it's the owner, NO just commerceId of the one which it's the owner , NO commerce under this user. Exception   
    .catch(({data, response}) => {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })

});

router.post('/name', function(req, res) {

  rest.postJson(constants.COMMERCE_API_END_POINT + 'name?page=' + req.query.page, req.body.data ,{headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

router.post('/:commerceId/saveQuestionFrom', validateToken, function(req, res) {
  var userId = req.query.userId;

  rest.postJson(constants.COMMERCE_API_END_POINT + req.params.commerceId + '/saveQuestionFrom?userId=' + userId
    , req.body, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });
});

router.post('/exists/location', function(req, res) {

  rest.postJson(constants.COMMERCE_API_END_POINT + '/exists/location'
    , req.body.location, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });
});

router.get('/:commerceId/questions', function(req, res) {
  let page = req.query.page;
  rest.get(constants.COMMERCE_API_END_POINT + req.params.commerceId + '/questions?page=' + page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      processData(data)
      let pages = getAmountPages(data.total, data.perPages)
      data.pages = pages
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });


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
        comment.answer.differenceDays = getDiffDays(comment.createdOn, inputFormat)
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

  //TEST
  function setFilterDate(date, inputFormat) {
    let formattedDate = moment(date, inputFormat)

    let diffDays = moment().diff(formattedDate, 'd')

    let hoy = diffDays <= 1
    let ultimaSemana = (diffDays <= 7)
    let ultimoMes = (diffDays <= 30)

    console.log("fecha completa: ", date)
    console.log("diferencia dias: ", diffDays)
    console.log("hoy: ", hoy)
    console.log("ultimo mes: " ,ultimoMes)
    console.log("ultima semana",ultimaSemana)

  }

});

router.get('/:commerceId/ratings', function(req, res) {
  var page = req.query.page;

  rest.get(constants.COMMERCE_API_END_POINT + req.params.commerceId + '/ratings?page=' + page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });
});

router.post('/save', multipartyMiddleware, function(req, res) {
  updateCommerceData(req, res, constants.COMMERCE_API_END_POINT + 'save?userId=' + req.query.userId)
});

router.post('/quickSaveTotal', multipartyMiddleware, function(req, res) {
  rest.postJson(constants.COMMERCE_API_END_POINT + 'quickSaveTotal', JSON.parse(req.body.data), {headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send({
        token: createJWT(data.user),
        userId: data.user.id,
        nickName: data.user.nickName,
        email: (data.user.email != undefined && data.user.email) ? data.user.email.toLowerCase() : data.user.email,
        lastLogin: data.user.lastLogin,
        commerceId: data.commerceId,
        hasCommerce: true,
        activated: false,
      })      
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    });
});
  
router.post('/modify/:commerceId', multipartyMiddleware, function(req, res) {
  updateCommerceData(req, res, constants.COMMERCE_API_END_POINT + 'modify/' + req.params.commerceId + '?userId=' + req.query.userId)
});

router.post('/quickModify/:commerceId', multipartyMiddleware, function(req, res) {
  updateCommerceData(req, res, constants.COMMERCE_API_END_POINT + 'quickModify/' + req.params.commerceId + '?userId=' + req.query.userId)
});

function createJWT(user) {
  var payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(constants.MAX_DAYS, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

function updateCommerceData(req, res, endpoint) {
  let data = JSON.parse(req.body.data)

  let commerce = data.commerce
  let typeImages = data.typeImages
  let files = req.files.files || []
  let images = commerce.images
  let dataFiles = []

  processFiles(files, typeImages, images, dataFiles)

  commerce.images = images

  rest.postJson(endpoint, commerce, {headers: headers.traderHeader})
    .on('success', function (data, response) {
      let commerceId = data.result
      let logoName = imageTransformer.getCommerceLogoFromImages(commerce.images, commerceId)  || ""
     
      if(dataFiles.length) {
        let base = 'commerces/' + commerceId + '/'
        addBase(dataFiles, base)

        
        clientS3.putBatch(dataFiles)
          .then(function(data) {
            return res.send({commerceId: commerceId, logo: logoName})
          })
          .catch(function(data) {
            return res.send(data)
          })
      } else {
        return res.send({commerceId: commerceId, logo: logoName})
      }

    }).on('fail', function (data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  })

  function addBase(dataFiles, base) {
    dataFiles.forEach(function(dataFile) {
      //console.log("key: ", base + dataFile.key)
      dataFile.key = base + dataFile.key
    })
  }

  function processFiles(files, typeImages, images, dataFiles) {
    files.forEach(function (file, index) {
      let type = typeImages[index]
      let extension = file.type.split("/")[1]  
      let key = generateKey(file.name, extension)
      addImage(images, key, type)
      addFile(dataFiles, key, file)
    })
  }

  function generateKey(fileName, extension) {
    const timestamp = (new Date()).getTime()
    const hash = require('crypto').createHash('md5').update(fileName + timestamp).digest("hex")
    return hash + "." +(extension.toLowerCase())
  }

  function addFile(dataFiles, key, file) {
    dataFiles.push({
      key: key,
      stream: fs.createReadStream(file.path)
    })
  }

  function addImage(images, key, type) {
    let image = {
      name: key,
      activated: true,
      map: false,
      logo: false,
      front: false,
      inside: false,
      streetView: false,
      employers: false,
      workStation: false
    }

    image[type] = true

    images.push(image)
  }
}


router.post('/:commerceId/saveCommerceEditSuggestion', function(req, res) {
  var userId = req.query.userId;

  rest.postJson(constants.COMMERCE_API_END_POINT + req.params.commerceId + '/saveCommerceEditSuggestion?userId=' + userId,
    req.body.commerceEditSuggestion, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });
});

router.post('/claim', function (req, res) {
  rest.postJson(constants.COMMERCE_API_END_POINT + 'user/claim?commerceId=' + req.query.commerceId + '&userId=' + req.query.userId, {},
    { headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send(data);
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})

router.get('/hasClaim', function (req, res) {
  rest.get(constants.COMMERCE_API_END_POINT + 'user/has/claim?commerceId=' + req.query.commerceId + '&userId=' + req.query.userId,
    { headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send(data);
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})

router.get('/:commerceId/products/coupons', function (req, res) {
  rest.get(constants.COMMERCE_API_END_POINT + req.params.commerceId + '/products/coupons',{ headers: headers.traderHeader})
    .on('success', function(data, response) {

      let coupons = data.coupons

      if(coupons.length) {
        coupons.forEach(function (coupon) {
          couponTransformer.addExtraInformationToCoupon(coupon, coupon.commerceId)
        })
      }

      completeProductImages(data.products)
      //addExtraInformation(data.data, req.params.commerceID)
      res.send({products : data.products, coupons: coupons})
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    })
})

//TODO it's repeated by product.js .. copy paste it in a productTransformer 
completeProductImages = function(products) {
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

function getAmountPages(total, sizePage) {
  return Math.ceil(total/sizePage)
}

module.exports = router;
