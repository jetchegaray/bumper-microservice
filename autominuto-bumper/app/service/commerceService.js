const rest = require('restler');
const constants = require('../utils/constants');
const headers = require('../utils/headers');
const utilWorkingHours = require('../utils/workingHours')
const utilPhones = require('../utils/phones')
const imageTransformer = require('../utils/imageTransformer')
const _ = require('underscore')

exports.findByCommerceId = (commerceId) => {
  return new Promise((resolve, reject) => {
    rest.get(constants.COMMERCE_API_END_POINT + "find/" + commerceId, {headers : headers.traderHeader})
      .on('success', data => {
        let topServicesNoQuoteables = _.chain(data.popularServices).filter(function(service) {return (service.service == true && service.quoteable == false)}).first(10).value()
        let topServicesQuoteables = _.chain(data.popularServices).filter(function(service) {return (service.service == true && service.quoteable == true)}).first(10).value()
        let topSpareParts = _.chain(data.popularServices).filter(function(product) {return product.service == false}).first(10).value()
   
        let result =  {
          id : data.id,
          serviceOfficialBrands: data.serviceOfficialBrands,
          sparePartsOfficialBrands: data.sparePartsOfficialBrands,
          description: data.description,
          facebook: data.facebook,
          twitter: data.twitter,
          youtube: data.youtube,
          email: data.email, //used from plans
          name: data.name,
          address: buildAddress(data.location),
          commerceWeb: data.commerceWeb || "",
          validated: data.validated,
          workingTime: data.workingTime,
          workingHours: buildWorkingHours(data.workingHours),
          phones: addPhones(data.phones),
          nextelId: data.nextelId,
          location: data.location,
          brands: getBrands(data.specializedBrands, data.sparePartsBrands),
          rating: data.ratingSummary ? getRating(data.ratingSummary.average) : 0,
          typeCommerceQuality: data.typeCommerceQuality,
          isOpen: utilWorkingHours.isCommerceOpen(data.workingHours),
          hasWifi: data.hasWifi,
          hasAir: data.hasAir,
          hasWaitingArea: data.hasWaitingArea,
          hasComputerDiagnostics: data.hasComputerDiagnostics,
          hasPostSales: data.hasPostSales,
          hasGaranty: data.hasGaranty,
          hasTemporalCar: data.hasTemporalCar,
          hasSavingPlan: data.hasSavingPlan,
          manufacture: data.manufacture,
          distributor: data.distributor,
          hasAir: data.hasAir,
          ratingSummary: { total: data.ratingSummary.total, average: getRating(data.ratingSummary.average) },
          recomendationSummary: { total: data.recomendationSummary.total, average: getRating(data.recomendationSummary.average) },
          images: imageTransformer.getCommerceLogo(data.images, commerceId),
          hasPlan: data.hasPaidPlan,
          hasAnOwner: data.hasAnOwner,
          types: data.types,
          services: data.services,
          topServicesNoQuoteables: topServicesNoQuoteables,
          topServicesQuoteables: topServicesQuoteables,
          topSpareParts: topSpareParts,
          isASeller: isASeller(data.types),
          paymentMethods : data.paymentMethods,
        }
        resolve(result)

      })
      .on('fail', (data, response) => reject({data, response}))
  })
}


exports.findByCommerceIdOwner = (commerceId, userId) => {
  return new Promise((resolve, reject) => {
    rest.get(constants.COMMERCE_API_END_POINT + "find/" + commerceId + '/owner?userId=' + userId, {headers : headers.traderHeader})
      .on('success', data => {
        let result =  {
          id : data.id,
          forwarding : isForwarding(data),
          serviceOfficialBrands: data.serviceOfficialBrands,
          sparePartsOfficialBrands: data.sparePartsOfficialBrands,
          description: data.description,
          facebook: data.facebook,
          twitter: data.twitter,
          youtube: data.youtube,
          name: data.name,
          address: buildAddress(data.location),
          commerceWeb: data.commerceWeb || "",
          validated: data.validated,
          workingTime: data.workingTime,
          workingHours: buildWorkingHours(data.workingHours),
          phones: addPhones(data.phones),
          nextelId: data.nextelId,
          location: data.location,
          brands: getBrands(data.specializedBrands, data.sparePartsBrands),
          rating: data.ratingSummary ? getRating(data.ratingSummary.average) : 0,
          typeCommerceQuality: data.typeCommerceQuality,
          isOpen: utilWorkingHours.isCommerceOpen(data.workingHours),
          hasWifi: data.hasWifi,
          hasAir: data.hasAir,
          hasWaitingArea: data.hasWaitingArea,
          hasComputerDiagnostics: data.hasComputerDiagnostics,
          hasPostSales: data.hasPostSales,
          hasGaranty: data.hasGaranty,
          hasTemporalCar: data.hasTemporalCar,
          hasSavingPlan: data.hasSavingPlan,
          manufacture: data.manufacture,
          distributor: data.distributor,
          hasAir: data.hasAir,
          ratingSummary: getRatingSummary(data),
          recomendationSummary: getRecomendationSummary(data),
          images: imageTransformer.getCommerceLogo(data.images, commerceId),
          hasPlan: data.hasPaidPlan,
          hasAnOwner: data.hasAnOwner,
          types: data.types,
          services: data.services,
          popularServices: data.popularServices,
          isASeller: isASeller(data.types),
          paymentMethods : data.paymentMethods,
        }
        resolve(result)

        function isForwarding(data){
          return data.types.length == 0 && data.serviceBrands.length == 0 && data.serviceOfficialBrands.length == 0 && data.sparePartsOfficialBrands.length == 0 && data.sparePartsBrands.length == 0
        } 
        

        function getRatingSummary(data){
          if (data.ratingSummary == null || data.ratingSummary == undefined){
            return { total : 0, average : 0 }
          }
          return { 
            total: data.ratingSummary.total, 
            average: getRating(data.ratingSummary.average) 
          }
        }

        function getRecomendationSummary(data){
          if (data.recomendationSummary == null || data.recomendationSummary == undefined){
            return { total : 0, average : 0 }
          }
          return { 
            total: data.recomendationSummary.total, 
            average: getRating(data.recomendationSummary.average) 
          }
        }
      })
      .on('fail', (data, response) => reject({data, response}))
  })
}


  function isASeller(types) {
    let foundIt = false
    types.forEach(function(type) {
      if(type.name.startsWith("Concesionaria")) {
        foundIt = true
      }
    })
    return foundIt
  }      



  function getRating(rating) {
    let integer = Math.floor(rating)
      return (rating - integer > 0) ? integer + 0.5 : integer
  }


  function getPathLogo(commerceId, images) {
    let logo = images.find(function(image) {
      return image.logo && image.activated
    })

    return logo ? imageTransformer.getImageCommercePathFromName(commerceId, logo.name) : ""
  }

  function getBrands(specializedBrands, sparePartsBrands) {
    let brands = specializedBrands.map(function(brand) { return { imageName: brand.imageName, name: brand.name } })
    return brands.concat(sparePartsBrands.map(function(brand) { return { imageName: brand.imageName, name: brand.name } }))
  }

  function addPhones(phones) {
    let commercePhones = []

    _.each(phones, function (phone) {
      let transformedPhone = utilPhones.formatPhone(phone)
      let tPhone = {
        acceptWhatsapp: phone.acceptWhatsapp,    
        printNumber: transformedPhone.printNumber
      }
      commercePhones.push(tPhone)
    })

    return commercePhones
  }

  function buildAddress(location) {
    var address = (location && location.streetAddress)? location.streetAddress.street + " " +
      location.streetAddress.streetNumber + ", " + location.place.city  + ", " + location.place.province: ""

    return address
  }

  function buildWorkingHours(workingHours){
    if (workingHours !== null && workingHours !== undefined){
      let periodsTransformed
      if (workingHours.periods !== undefined && workingHours.periods !== null && workingHours.periods.length > 0){
        periodsTransformed = utilWorkingHours.parseWorkingHours(workingHours)
      }
      let open24 = workingHours.open24 
      return {periods :  periodsTransformed, open24: open24} 
    }
    return null
  }