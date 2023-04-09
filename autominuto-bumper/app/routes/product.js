const rest 			  = require('restler')
const constants   = require('../utils/constants')
const path        = require('path')
const fs          = require('fs')
const	express 		= require('express')
const headers     = require('../utils/headers')
const winston     = require('winston')
var     _         = require('underscore')
const multiparty  = require('connect-multiparty')
const multipartyMiddleware = multiparty()
const clientS3 = require('../utils/autominuto-s3')
const imageTransformer = require('../utils/imageTransformer')


const router = express.Router()

router.delete('/:productID', function(req, res) {
  rest.del(constants.PRODUCT_API_END_POINT + '/' + req.params.productID, {headers : headers.traderHeader})
    .on('success', function (data, response) {
      res.send(data)
    })
    .on('fail', function (data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/:productID/edit', multipartyMiddleware, function(req, res) {
  saveProduct(req, res, constants.PRODUCT_API_END_POINT + '/' + req.params.productID + '/edit')
})

router.post('/save', multipartyMiddleware, function(req, res) {
  saveProduct(req, res, constants.PRODUCT_API_END_POINT + '/save?commerceId=' + req.query.commerceId)
})

function saveProduct(req, res, endpoint) {
  let data = JSON.parse(req.body.data)

  let files = req.files.files || []
  let dataFiles = [] // for s3
  let images = (data.product.images != undefined && data.product.images.length > 0) ? data.product.images : [] // for server
  let product = data.product
  images = cleanImageNames(images)
  let imageKeys = generateKeys(files)

  imageKeys.forEach(function(key) {
    images = []
    images.push({
      name: key,
      main: true // for now
    })
  })

  product.images = images
  product.serviceType = product.serviceType
  product.serviceTypeId = product.serviceType.id
//  delete product.serviceType 

  rest.postJson(endpoint, product, {headers : headers.traderHeader})
    .on('success', function (data, response) {
      let productId = data.id
      // to return it more 
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
    })
    .on('fail', function (data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
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

}

const generateKey = (fileName) => {
  let extension = path.extname(fileName)
  const timestamp = (new Date()).getTime()
  const hash = require('crypto').createHash('md5').update(fileName + timestamp).digest("hex") + extension.toLowerCase()
  return hash
}

router.post('/saveAllWithImages', multipartyMiddleware, (req, res) => {
  const commerceId = req.query.commerceId
  const {serviceType, services} = JSON.parse(req.body.data)
  let images = []
  let keyImages = []
  let imageFiles = []

  if (req.files && req.files.files){
    const imageFiles = req.files.files
    keyImages = generateKeys(imageFiles)
    images = [{name: keyImages[index], main: true}]
  }

  const products = services.map(({name, temporaryBrand, code, price, description}, index) => {
    return {name, temporaryBrand, code, price, description, images, service: false}
  })
  let serviceTypeId = serviceType.id

  rest.postJson(constants.PRODUCT_API_END_POINT + 'saveAll?commerceId=' + commerceId, {serviceTypeId, products}, {headers : headers.traderHeader})
    .on('success', (data) => {
      if (keyImages.length) {

        Promise.all(
            data.result.split(',').map((productId,index) => {
              return clientS3.putBatch([{
                key: 'products/' + productId + '/' + keyImages[index], stream: fs.createReadStream(imageFiles[index].path)
              }])
            })
        )
        .then(() => res.send(data))
        .catch(error => res.status(500).send({error}))      
        }

        res.send(data)
    })
    .on('fail', (data, response) => {
      winston.error({data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })

    function generateKeys(files) {
      return files.map(function(file) {
        return generateKey(file.name)
      })
    }
})

router.post('/saveAll', multipartyMiddleware, (req, res) => {
  const commerceId = req.query.commerceId
  
  const {services} = JSON.parse(req.body.data)
  const imageFile = req.files.files
  const keyImage = (imageFile) ? generateKey(imageFile.name).toLowerCase() : ""
 
  const products = services.map(({nombre, marca, codigo, descripcion, precio, stock, categoria}) => {
    const images = [{name: keyImage, main: true}]
    return {name : nombre, description: descripcion, stock: stock, price: precio, aliasCategory: categoria, code: codigo, temporaryBrand: marca, images}
  })
  
  rest.postJson(constants.PRODUCT_API_END_POINT + 'saveAll?commerceId=' + commerceId, {products}, {headers : headers.traderHeader})
    .on('success', (data) => {
      
      if (imageFile){
        Promise.all(
          data.result.split(',').map(productId => {
            return clientS3.putBatch([{
              key: 'products/' + productId + '/' + keyImage, stream: fs.createReadStream(imageFile.path)
            }])
          }))
          .then(() => res.send(data))
          .catch(error => res.status(500).send({error}))
      }
    })
    .on('fail', (data, response) => {
      winston.error({data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/saveAllWithoutImages', multipartyMiddleware, (req, res) => {
  const commerceId = req.query.commerceId
  
  const {services} = JSON.parse(req.body.data)
 
  const products = services.map(({nombre, marca, codigo, descripcion, precio, stock, categoria}) => {
    return {name : nombre, description: descripcion, stock: stock, price: precio, aliasCategory: categoria, code: codigo, temporaryBrand: marca}
  })
  rest.postJson(constants.PRODUCT_API_END_POINT + 'saveAll?commerceId=' + commerceId, {products}, {headers : headers.traderHeader})
    .on('success', (data) => {
      res.send(data)
    })
    .on('fail', (data, response) => {
      winston.error({data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/getAllBy/:commerceID', function(req, res) {
  rest.postJson(constants.PRODUCT_API_END_POINT +'getAllBy/' +
    req.params.commerceID + "?page=" + req.query.page, req.body.data, {headers : headers.traderHeader})
    .on('success', function(data, response){
      let pages = getAmountPages(data.total)
      completeProductImages(data.data)

      let result = { products: data.data,  pages: pages }

      res.send(result)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

router.post('/getAllByWithCategoriesLikeProducts/:commerceID', function(req, res) {
  rest.postJson(constants.PRODUCT_API_END_POINT +'getAllByWithCategoriesLikeProducts/' +
    req.params.commerceID + "?page=" + req.query.page, req.body.data, {headers : headers.traderHeader})
    .on('success', function(data, response){
      let pages = getAmountPages(data.total)
      completeProductImages(data.data)

      let result = { products: data.data,  pages: pages }

      res.send(result)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})


router.get('/:productID', function(req, res) {

  rest.get(constants.PRODUCT_API_END_POINT + req.params.productID, {headers : headers.traderHeader})
    .on('success', function(data, response){
      var results = []
      results.push(data)
      completeProductImages(results)
      res.send(results[0])
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });

})

router.get('/related/:productID', function(req, res) {
  rest.get(constants.PRODUCT_API_END_POINT +'related/' + req.params.productID, {headers : headers.traderHeader})
    .on('success', function(data, response){
      dataSample = _.sample(data, 4)
      completeProductImages(dataSample)
      res.send(dataSample)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

router.get('/:productID/questions', function(req, res) {

  rest.get(constants.PRODUCT_API_END_POINT + req.params.productID + '/questions?page=' + req.query.page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      processData(data)
      res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

router.post('/:productId/saveQuestionFrom', function(req, res) {
  var userId = req.query.userId;

  rest.postJson(constants.COMMERCE_API_END_POINT + req.params.productId + '/saveQuestionFrom?userId=' + userId
    , req.body.comment, {headers : headers.traderHeader})
    .on('success', function(data, response){
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
  });
});

function processData(data) {
  let comments = data.data
  let inputFormat = "DD-MM-YYYY hh:mm"

  _.each(comments, function (comment) {
    comment.userFrom = getCleanUserData(comment.userFrom)

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
    image: userFrom.imageName
  }
}

function getDiffDays(date, inputFormat) {
  let formattedDate = moment(date, inputFormat)
  return moment().diff(formattedDate, 'd')
}

function getAmountPages(total) {
  let sizePage = 15
  return Math.ceil(total/sizePage)
}

function saveProductImages(products) {
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

router.get('/getInitialData/:commerceId', function(req, res) {
  rest.get(constants.PRODUCT_API_END_POINT +'getAllByCommerce/' +
    req.params.commerceId + "?page=1", {headers : headers.traderHeader})
    .on('success', function(data, response){
      completeProductImages(data.results)
      let filters = buildFilterForBoard(data.filters)
      let pages = getAmountPages(data.total)
      res.send({products: data.results, filters: filters, pages: pages})
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

router.get('/getInitialDataWithCategories/:commerceId', function(req, res) {
  rest.get(constants.PRODUCT_API_END_POINT +'getAllByCommerceWithCategoriesLikeProducts/' +
    req.params.commerceId + "?page=1", {headers : headers.traderHeader})
    .on('success', function(data, response){
      
      completeProductImages(data.products)
      completeProductImages(data.services)
      
      let filters = buildFilterForProfile(data.filters)
    
      let servicePages = getAmountPages(data.totalServices)
      let productPages = getAmountPages(data.totalProducts)
     
      res.send({products: data.products, services: data.services, filters: filters, servicePages: servicePages, productPages: productPages})
    
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
})

function buildFilterForBoard(filters) {
  let filterByCategory = {
    type: 'category',
    values: []
  }

  let filterByPrice = {
    type: 'price',
    values: [ //hardcoded
      {name: "Hasta $500", min: 0, max: 500, active: false},
      {name: "$500 a $1000", min: 500, max: 1000, active: false},
      {name: "$1000 a $20000", min: 1000, max: 20000, active: false}
    ]
  }

  _.forEach(filters.filter, function(service) {
    let flatService = {levelOne: service.id, name: service.name, active: false}
    filterByCategory.values.push(flatService)
  })

  return [ filterByCategory ]
}

function buildFilterForProfile(filters) {
  let filterByCategoryService = {
    type: 'categoryService',
    values: []
  }

  let filterByCategorySpareParts = {
    type: 's',
    values: []
  }

  let filterByPrice = {
    type: 'price',
    values: [ //hardcoded
      {name: "Hasta $500", min: 0, max: 500, active: false},
      {name: "$500 a $1000", min: 500, max: 1000, active: false},
      {name: "$1000 a $20000", min: 1000, max: 20000, active: false}
    ]
  }

  _.forEach(filters.filter, function(service) {
    let flatService = {levelOne: service.id, name: service.name, active: false}

    if (service.service == false){
      filterByCategorySpareParts.values.push(flatService)
    }else {
      filterByCategoryService.values.push(flatService)
    }
  })

  //return [ filterByCategory, filterByPrice ]
  return [ filterByCategoryService, filterByCategorySpareParts ]
}    

module.exports = router;
