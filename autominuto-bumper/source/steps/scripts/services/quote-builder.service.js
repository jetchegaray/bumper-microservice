angular.module('amApp')
  .factory('QuoteBuilder', ['localStorageService', 'EXTRA_FIELDS', 'TIPO_PRODUCTO', function (localStorageService, EXTRA_FIELDS, TIPO_PRODUCTO) {

    var QUOTE_DATA = 'quote_data'

    const base64ToFile = base64 => {
      if (base64) {
        const arr = base64.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        //second parameter is the name of the image. If i use the same name always. the id in nodejs at saving time will be the same. so bug equals images
        function chr4(){
          return Math.random().toString(16).slice(-4);
        }
        //728bb9221e13f952192bc243fcd4c388
        return new File([u8arr], chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4() + chr4(), {type: mime});
      } else {
        return null
      }
    }

    return {
      STEP_ONE: 1,
      STEP_TWO: 2,
      STEP_THREE: 3,
      STEP_FOUR: 4,
      addExplanations: function(explanations) {
        var quoteData = localStorageService.get(QUOTE_DATA) || {} //TODO MODIFICAR TODO ESTO
        quoteData.explanations = explanations
        localStorageService.set(QUOTE_DATA, quoteData)
      },
      addCarData: function (cars) {
        var quoteData = localStorageService.get(QUOTE_DATA) || {} //TODO MODIFICAR TODO ESTO
        quoteData.search = {}

        quoteData.brandId = cars[0].brand.id
        quoteData.subbrandInternalId = (cars[0].subBrand) ? cars[0].subBrand.internalId : ""
        quoteData.SubBrandName = (cars[0].subBrand) ? cars[0].subBrand.name : ""

        quoteData.chasisNumber = cars[0].vin
        quoteData.carYear = cars[0].year
        quoteData.brandName = cars[0].brand.name
        quoteData.search.brand = cars[0].brand.slug
        quoteData.carKms = cars[0].kms
        quoteData.carInsuranceId = (cars[0].insurance) ? cars[0].insurance.id : null
        quoteData.carInsuranceName = (cars[0].insurance) ? cars[0].insurance.name : null

        localStorageService.set(QUOTE_DATA, quoteData)
      },

      addLocation: function (location) {
        var quoteData = localStorageService.get(QUOTE_DATA)
        quoteData.location = location
        localStorageService.set(QUOTE_DATA, quoteData)
      },
      addAppointments: function(appointments) {
        var quoteData = localStorageService.get(QUOTE_DATA)
        quoteData.possibleAppointments = appointments

        localStorageService.set(QUOTE_DATA, quoteData)
      },
      getCarData: function() {
        var quoteData = localStorageService.get(QUOTE_DATA)

        return {
          brandId: quoteData.brandId,
          brandName: quoteData.brandName,
          subbrandInternalId: quoteData.subbrandInternalId,
          chasisNumber: quoteData.vin,
          year: quoteData.carYear,
          kms: quoteData.carKms,
          insuranceId : quoteData.insuranceId
        }
      },
      getFirstChild: function(parent) {
        return (parent.childrens && parent.childrens.length) ? parent.childrens[0] : null
      },
      getCategoryDetails: function(category) {
        return category.name
      },
      getIssuesData: function() {
        var quoteData = localStorageService.get(QUOTE_DATA)

        return {
          defaultIssue: quoteData.defaultIssueCategory,
          // problemsNames : quoteData.problemsNames,
          problemsNames : this.getCategoryDetails(quoteData.categories),
          categories: quoteData.categories,
          categoryName : this.getCategoryDetails(quoteData.categories)
        }
      },
      getLocation: function() {
        var quoteData = localStorageService.get(QUOTE_DATA)
        return quoteData.location
      },
      getSimpleLocation: function() {
        var location = localStorageService.get(QUOTE_DATA).location
        var simpleLocation = location.streetAddress.street + " " +
                                location.streetAddress.streetNumber + " "

        if (location.streetAddress.neighborhood)
          simpleLocation += location.streetAddress.neighborhood + ", "
        if (location.place.province)
          simpleLocation += location.place.province + ", "
        if (location.place.province)

        simpleLocation += " " + location.place.countryCode
        return simpleLocation
      },
      buildSimpleLocation: function(location) {
        var simpleLocation = location.streetAddress.street + " " +
                                location.streetAddress.streetNumber + " "

        if (location.streetAddress.neighborhood)
          simpleLocation += location.streetAddress.neighborhood + ", "
        if (location.place.province)
          simpleLocation += location.place.province + ", "
        if (location.place.province)

        simpleLocation += " " + location.place.countryCode
        return simpleLocation
      },
      getQuoteData: function() {
        var quoteData = localStorageService.get(QUOTE_DATA) || {}
        return quoteData
      },
      getBrandData: function() {
        var quoteData = localStorageService.get(QUOTE_DATA)
        if (quoteData)
          return {
            brandname: quoteData.brandName,
            subBrandName: quoteData.SubBrandName,
            chasisNumber: quoteData.chasisNumber,
            year: quoteData.carYear,
            kms : quoteData.carKms,
            insuranceName : quoteData.insuranceName
          }
        else
          return null
      },
      buildDataForSavingQuote: function(quoteData) {

        let newQuoteData = angular.copy(quoteData)
        newQuoteData.quoteType = quoteData.categories.quoteable ? 'QUOTE_REQUEST' : 'TURN_REQUEST'
        newQuoteData.serviceTypeIds = []
        newQuoteData.serviceTypeIds.push(quoteData.categories.id)
        newQuoteData.serviceTypeDetail = ''
        newQuoteData.imagesList = []
        
        if (quoteData.sparePartIncluded) {
          newQuoteData.serviceTypeDetail += "Incluye Repuesto " + ': Si, '
        }

        _.forEach(newQuoteData.categories.components, (component) => {

          switch (component.componentType) {

            case EXTRA_FIELDS.INPUT_TEXT :
              _.forEach(component.options, o => {
                if (o.value) {
                  let name = o.name.split("*")[0].split("(Opcional")[0]
                  newQuoteData.serviceTypeDetail += name + ': ' + o.value + ','
                }
              })
              break;
            case EXTRA_FIELDS.DROP_DOWN :
              _.forEach(component.options, o => {
                if (o.selected) {
                  if (o.name.toLowerCase().trim() == TIPO_PRODUCTO.ALTERNATIVO_NACIONAL.toLowerCase()
                   || o.name.toLowerCase().trim() == TIPO_PRODUCTO.ALTERNATIVO_IMPORTADO.toLowerCase()
                   || o.name.toLowerCase().trim() == TIPO_PRODUCTO.OFICIAL.toLowerCase()
                   || o.name.toLowerCase().trim() == TIPO_PRODUCTO.NO_SE.toLowerCase()) {
                    newQuoteData.serviceTypeDetail += 'Tipo de producto' + ': ' + o.name + ','
                  } else {
                    newQuoteData.serviceTypeDetail += o.name + ': ' + 'Si' + ','
                  }
                }
              })
              break;
            case EXTRA_FIELDS.CHECK_BOX :
              _.forEach(component.options, o => {
                if (o.selected) {
                  newQuoteData.serviceTypeDetail += o.name + ': ' + 'Si' + ','
                }
              })
              break;
            case EXTRA_FIELDS.RADIO_BUTTON :
              if (component.selected) {
                newQuoteData.serviceTypeDetail += component.title
                  ? (component.title + ': ' + component.selected + ',')
                  : (component.selected + ': ' + 'Si' + ',')
              }
              break;
            case EXTRA_FIELDS.INPUT_IMAGES :
               _.map(component.images, function (image) {
                 newQuoteData.imagesList.push(base64ToFile(image))
              })
              break;
          }
        })

        newQuoteData.brandId = newQuoteData.brandId || ''
        newQuoteData.subbrandInternalId = newQuoteData.subbrandInternalId
        newQuoteData.chasisNumber = newQuoteData.chasisNumber || ''
        newQuoteData.carYear = newQuoteData.carYear || ''

        delete newQuoteData.categories
        delete newQuoteData.SubBrandName
        delete newQuoteData.search

        return newQuoteData
      }
    }
  }])
