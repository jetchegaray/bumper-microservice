const _         = require('underscore')
const rest      = require('restler')
const constants = require('../utils/constants')
const headers   = require('../utils/headers')
const express   = require('express')
const utilWorkingHours = require('../utils/workingHours')
const utilOfficialBranding = require('../utils/officialBranding')
const imageTransformer = require('../utils/imageTransformer')
const winston   = require('winston')
const router    = express.Router()




router.get('/brand/:brandId', function (req, res) {
  rest.get(constants.SEARCH_API_END_POINT + '/brand/' + req.params.brandId, {headers: headers.traderHeader})
    .on('success', function(data, response) {
      res.send({
        brandImage: 'assets/images/brands/logo/' + data.imageName,
        name: data.name,
        slug: data.slug
      })
    })
    .on('fail', function(data, response) {
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})


router.put('/', function(req, res) {

  const recommendedFilterMin = 0
  const qualityFilterMin = 0
  
  // Parse page number
  let page = parseInt(req.query.page)
  if (isNaN(page)) {
    res.dispatch(400, 'Page parameter invalid')
    return
  }

  // Parse orderBy code
  let orderBy = parseInt(req.query.orderBy)
  if (isNaN(orderBy)) {
    res.dispatch(400, 'Sort parameter invalid')
    return
  }

  // Parse search params
  const searchParams = {}
  const matcher = {
    subbrandInternalId: 'subbrandId',
    carYear: 'carYear',
    chasisNumber: 'chasisNumber',
    defaultIssue: 'issue',
    location: 'location',
    onlyOfficial: 'onlyOfficialCommerces',
    onlyOfficialParts: 'onlyOfficialSpareParts',
    radius: 'radius'
  }
  for (const param in matcher) {
    const value = req.body[matcher[param]]
    if (value !== 'undefined') {
      searchParams[param] = req.body[matcher[param]]
    }
  }

  //brand could be optional. cick popular categories from home f.e
  if (!searchParams.brandId && req.body.brand)
    searchParams.brandId = req.body.brand.id
 
  searchParams.serviceId =  req.body.service.id

  // Parse filters
  let recommended = req.body.filters.recommended
  let quality = req.body.filters.quality
  let promo = req.body.filters.promo
  recommended = typeof recommended === 'undefined' ? true : !!recommended
  quality = typeof quality === 'undefined' ? true : !!quality
  promo = typeof promo === 'undefined' ? true : !!promo
  const url = constants.SEARCH_API_END_POINT + `?page=${page}`
 
  rest.postJson(url, searchParams, {headers: headers.traderHeader}).on('success', (data) => {

    const d = data.data
    let couponIndex = 0
//    const officialBranding = utilOfficialBranding.generateOfficialBranding(data.officialBranding)
    const r = []
    d.forEach(c => {
     

      /*if (recommended && c.totalRecommendations <= recommendedFilterMin) return
      if (quality && c.totalRating <= qualityFilterMin) return
      if (promo  && c.coupons.length == 0) return
*/
  
  /*    const price = c.products ? minNumber(c.products) : 0
   
      let products = c.products.map(item => {

        let imageProductName = imageTransformer.getImageMainProductPath(item.id, item.images, 40, 68)
        if (!imageProductName){
          imageProductName = imageTransformer.getImageProductDisk(item.category)   
        }

        return {
          id : item.id,
          name: item.name,
          image: imageProductName,
          price: item.price
        }
      })
*/
      const position = []
      if (c.locationGeometry) {
        position.push(c.locationGeometry.coordinates[1])
        position.push(c.locationGeometry.coordinates[0])
      }

      let brandsChunk = []
      let brands = _.union(c.summarySpecializedBrands, c.summarySparePartsBrands)
      if (brands.length){
        for (var i = brands.length - 1; i >= 0; i--) {
          brandsChunk.push(brands[i])
        }
      }
      
      let coupons = (data.otherData[couponIndex] != undefined && data.otherData[couponIndex]) ? [data.otherData[couponIndex]] : []
      couponIndex++

      r.push({
        id: c.commerceId,
        name: c.name,
        description: c.description,
        official: c.serviceBrandOfficial || c.sparePartsOfficial,
        logo: imageTransformer.getImageCommercePathFromName(c.commerceId, c.logo, 80, 80),
        //validated: c.validated,
        grade: c.typeCommerceQuality,
        //price: price ? price : 0,
        stars: c.totalRating ? c.totalRating : 0,
        coupons: coupons,
      //  products: products,
        position: position,
        isOpen: utilWorkingHours.isCommerceOpen(c.workingHours),
        workingTime: c.workingTime,
        brands : brandsChunk,
        services : c.services,
        types : c.types,
        hasPaidPlan : c.selectedPlan && c.selectedPlan == "HIGHLINE",
        slug : c.slug
      })
    })

    // Sort results
    if (orderBy == 1) {
      _.sortBy(r, 'price')
    } else if (orderBy == 2) {
      _.sortBy(r, (c) => { return -c.price })
    }

    let nextPage = page * data.perPage < data.total
    let prevPage = page > 1

    res.dispatch(200, '', {results: r, nextPage: nextPage, prevPage: prevPage, officialBranding: [] })
  })
  .on('fail', (data) => {  
    res.dispatch(data.status, 'Something went wrong', data) })

  function minNumber(array) {
    if (array.length === 0) return 0
    let min = array[0].price
    for (let i = 0; i < array.length; i++) {
      if (array[i] < array[min]) min = i
    }
    return min
  }

})


router.get('/brands', function(req, res) {

  rest.get(constants.HOME_API_END_POINT + 'brands', {headers: headers.traderHeader})
    .on('success', function(data) {
    
      let brands = _.chain(data).filter(function(elem) {return elem.sparePart === false})
      .map(function(brand) 
        { return { brandId: brand.id,  subbrandId: null, value: brand.id, label: brand.name, slug: brand.slug} })
      .value()
    
      return res.dispatch(200, '', brands)
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

module.exports = router
