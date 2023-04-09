const rest                  = require('restler')
const path                  = require('path')
const constants             = require('../utils/constants')
const express               = require('express')
const headers               = require('../utils/headers')
const jwt                   = require('jwt-simple')
const bcrypt                = require('bcryptjs')
const config                = require('../config')
const moment                = require('moment')
const winston               = require('winston')
const fs                    = require('fs')
const userService           = require('../service/userService')
const commentTransformer    = require('../utils/commentTransformer')
const imageTransformer      = require('../utils/imageTransformer')
const multiparty            = require('connect-multiparty')
const clientS3              = require('../utils/autominuto-s3')
const multipartyMiddleware  = multiparty()
const utilPhones            = require('../utils/phones')
const XLSX 					       = require('xlsx')

const router                = express.Router();

router.post('/signUpUser', function(req, res) {
  let phone = req.body.phone
  if (phone){
    phone.countryCodeNumber = "+54"
    phone.acceptWhatsapp = true
  }
 
  const user = { email: req.body.email, password: req.body.password, nickName: buildNickName(req.body.email), phone: phone};

    rest.postJson(constants.USER_API_END_POINT + 'signUpUser', user, {headers : headers.traderHeader})
    .on('success', function(data, response){
      data.imageUrl = (data.image && data.image.name) ? imageTransformer.getImageUserPath(data.id, data.imageName) : imageTransformer.getImageUserPath(data.id, null)

      return res.send(data);
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);
     });
})

router.post('/socialSignUpUser', function(req, res) {
  const user = req.body;
 
  rest.postJson(constants.USER_API_END_POINT + 'socialSignUpUser', user, {headers : headers.traderHeader})
  .on('success', function(data, response){
    data.imageUrl = (data.image && data.image.name) ? imageTransformer.getImageUserPath(data.id, data.imageName) : imageTransformer.getImageUserPath(data.id, null)

    return res.send(data);
   }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
   });
})

router.post('/signUpCommerce', function(req, res) {
   const user = { email: req.body.email, password: req.body.password, nickName: buildNickName(req.body.email) };

   rest.postJson(constants.USER_API_END_POINT + 'signUpCommerce', user, {headers : headers.traderHeader})
   .on('success', function(data, response){
      data.imageUrl = (data.image && data.image.name) ? imageTransformer.getImageUserPath(data.id, data.imageName) : imageTransformer.getImageUserPath(data.id, null)
      return res.send(data)
     }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);
     });
})

function buildNickName(email) {
    return email.substr(0, email.indexOf('@'));
}

router.post('/socialSignUpCommerce', function(req, res) {
  const commerce = req.body;
 
   rest.postJson(constants.USER_API_END_POINT + 'socialSignUpCommerce', commerce, {headers : headers.traderHeader})
   .on('success', function(data, response){
      data.imageUrl = (data.image && data.image.name) ? imageTransformer.getImageUserPath(data.id, data.imageName) : imageTransformer.getImageUserPath(data.id, null)
      return res.send(data)
     }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data);
     });
})

router.post('/mailAlreadyExists', function(req, res) {
  const errorMessage = "El email ingresado ya esta en uso."
  rest.postJson(constants.USER_API_END_POINT + 'mailAlreadyExists', {email: req.body.email}, {headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send(data)
    })
    .on('fail', function(data, response) {
      winston.log('error', {data: data})
      data.message = errorMessage
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/login', function(req, res) {
  const user = {email: req.body.email, password: req.body.password}
  rest.postJson(constants.USER_API_END_POINT + 'login', user, {
      headers: headers.traderHeader
    })
    .on('success', function(data, response) {
      return res.send({
        token: createJWT(data),
        userId: data.id,
        nickName: data.nickName,
        email: data.email,
        lastLogin: data.lastLogin,
        hasCommerce: data.hasCommerce,
        imageUrl : imageTransformer.getImageUserPath(data.id, data.imageName),
        activated: data.activated,
      })
    }).on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/loginSocial', function(req, res) {
  const user = req.body;
  
  rest.postJson(constants.USER_API_END_POINT + 'socialLogin', user, {headers : headers.traderHeader})
    .on('success', function(data){
      data.imageUrl = (data.image && data.image.name) ? imageTransformer.getImageUserPath(data.id, data.imageName) : imageTransformer.getImageUserPath(data.id, null)
      return res.send(data)
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data);
    });
})

function createJWT(user) {
  var payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(constants.MAX_DAYS, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

router.get('/getUserData/:userId', function(req, res) {
  const userId = req.params.userId

  rest.get(constants.USER_API_END_POINT + userId + '/view', {
      headers: headers.traderHeader
    })
    .on('success', function(data, response){
      data.phones = utilPhones.formatPhones(data.phones)
      data.imageUrl = imageTransformer.getImageUserPath(data.id, data.imageName, 200, 200)
      res.send(data)
    })
    .on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    });
})

router.get('/activate', function(req, res) {
  const token = req.query.token;
  const salt = req.query.salt;
  rest.get(constants.USER_API_END_POINT + 'activate?token=' + token + '&salt=' + salt, {
      headers: headers.traderHeader
    })
    .on('success', function(data, response){
      data = {}
      data.activated = true
      return res.send(data);
    }).on('fail', function(data, response){
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})


router.get('/recoverPassword', function(req, res) {
    var user = { email: req.query.email};
    rest.postJson(constants.USER_API_END_POINT + 'recoverPassword', user, {headers : headers.traderHeader})
        .on('success', function(data, response){
            return res.send(data);
        }).on('fail', function(data, response){
            winston.log('error', {data: data})
            if (data.httpStatus) return res.status(data.httpStatus).send(data)
            if (response.status) return res.status(response.status).send(data)
            return res.status(500).send(data)
        });
});


router.post('/updatePassword', function(req, res) {
  const token = req.body.token
  const user = { password: req.body.password, verificationCode: req.body.verificationCode}

  rest.postJson(constants.USER_API_END_POINT + 'updatePassword?token=' + token, user, {headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send(data)
    }).on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
});

router.get('/sendMailActivation', function(req, res) {
  if (req.query.userId === undefined || req.query.userId === 'undefined') {
    return res.status(400).send({message: 'El usuario es inválido'})
  }
  const userId = req.query.userId
  rest.postJson(constants.USER_API_END_POINT + 'sendMailActivation/' + userId, {}, {headers: headers.traderHeader})
    .on('success', function(data, response) {
      return res.send(data)
    }).on('fail', function(data, response) {
      winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
  });
});


router.get('/:userId/commerces', function(req, res) {

	 rest.get(constants.USER_API_END_POINT + req.params.userId + '/commerces?page=' + req.query.page, {headers : headers.traderHeader})
	 .on('success', function(data, response){
         return res.send(data);
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
     });
});


router.get('/:userId/commerces/size', function(req, res) {

   rest.get(constants.USER_API_END_POINT + req.params.userId + '/commerces/size', {headers : headers.traderHeader})
   .on('success', function(data, response){
       return res.send(data);
     }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
     });
});

router.get('/:userId/cars', function(req, res) {
   var userId = req.params.userId;
	 rest.get(constants.USER_API_END_POINT + userId + '/cars', {headers : headers.traderHeader})
     .on('success', function(data, response) {
       return res.send(data)
     }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
   });
});


router.post('/:userId/addCar', function(req, res) {
   var car = req.body;
   var userId = req.params.userId;
   rest.postJson(constants.USER_API_END_POINT + userId + '/addCar', car, {headers: headers.traderHeader})
     .on('success', function(data, response) {
       return res.send(data)
     }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
   })
})


router.post('/:userId/addCars', multipartyMiddleware, function(req, res) {
   
 	let excelFile = req.files.file || null
	var userId = req.params.userId;

   	let cars = []
 	
	var workbook = XLSX.readFile(excelFile.path, { type: 'binary', cellDates: true, cellNF: false, cellText: false})
	var sheet_name_list = workbook.SheetNames;
	var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  let messageErrorBrand = "", messageErrorSubbrand = "", messageErrorType = "", messageErrorFuel = ""

	for (var i = 0; i < xlData.length; i++) {
    if (xlData[i].Marca && xlData[i].Modelo){

      if (xlData[i].Marca == undefined || !xlData[i].Marca){
        if (!messageErrorBrand.includes("marca")){
          messageErrorBrand += 'El campo marca es obligatorio en la/s fila/s ' + i+1 + " "
        }else {
          messageErrorBrand += i+1 + " "
        }
      } 
      if (xlData[i].Modelo == undefined || !xlData[i].Modelo){
        if (!messageErrorSubbrand.includes("modelo")){
          messageErrorSubbrand += 'El campo modelo es obligatorio en la/s fila/s ' + i+1 + " "
        }else {
          messageErrorSubbrand += i+1 + " "
        }
      } 
      if (xlData[i].Tipo_consumo == undefined || !xlData[i].Tipo_consumo){
        if (!messageErrorType.includes("Tipo_consumo")){
          messageErrorType += 'El campo Tipo_consumo es obligatorio en la/s fila/s ' + i+1 + " "
        }else {
          messageErrorType += i+1 + " "
        }
      }
      if (xlData[i].Combustible == undefined || !xlData[i].Combustible){
        if (!messageErrorFuel.includes("Combustible")){
          messageErrorFuel += 'El campo Combustible es obligatorio en la/s fila/s ' + i+1 + " "
        }else {
          messageErrorFuel += i+1 + " "
        }
      }      

			let car = {
				brandName : xlData[i].Marca, 
				subBrandName : xlData[i].Modelo, 
				year: xlData[i].Año, 
				kilometers : xlData[i].Kilometros,
				engineModel: xlData[i].Modelo_motor, 
				fuelConsumptionType: (xlData[i].Tipo_consumo) ? xlData[i].Tipo_consumo.toUpperCase(): xlData[i].Tipo_consumo,
				fuel : (xlData[i].Combustible) ? xlData[i].Combustible.toUpperCase(): xlData[i].Combustible, 
				insuranceName: xlData[i].Seguro,
				insuranceNumber: xlData[i].Nro_poliza,
				chasisNumber: xlData[i].Nro_chasis,
				licencePlate: xlData[i].Patente,
				licencePlateExpireDate: (xlData[i].Vto_patente) ? getMomentDate(xlData[i].Vto_patente) : xlData[i].Vto_patente,
				secureExpireDate: (xlData[i].Vto_seguro) ? getMomentDate(xlData[i].Vto_seguro): xlData[i].Vto_seguro,
				extinguisherExpireDate: (xlData[i].Vto_matafuego) ? getMomentDate(xlData[i].Vto_matafuego) : xlData[i].Vto_matafuego,
				vtvExpireDate: (xlData[i].Vto_vtv) ? getMomentDate(xlData[i].Vto_vtv) : xlData[i].Vto_vtv,
				licenceExpireDate : (xlData[i].Vto_licencia_arba) ? getMomentDate(xlData[i].Vto_licencia_arba) : xlData[i].Vto_licencia_arba
			}
			cars.push(car)		
    }	
	}

  if ((messageErrorBrand != undefined && messageErrorBrand) || (messageErrorSubbrand != undefined && messageErrorSubbrand) || (messageErrorType != undefined && messageErrorType) || (messageErrorFuel != undefined && messageErrorFuel)){
    return res.status(404).send(raiseErrorMandatoryField(messageErrorBrand + messageErrorSubbrand + messageErrorType + messageErrorFuel))
  }  

	let request = {
 		cars : cars
 	}

	rest.postJson(constants.USER_API_END_POINT + userId + '/addCars', request, {headers: headers.traderHeader})
     .on('success', function(data, response) {
       return res.send(data)
     }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
   })
})


function getMomentDate(data){
	let m = moment(data)
	m.set({hour:16,minute:0,second:0,millisecond:0})
	return m.format("DD-MM-YYYY HH:mm")
}


function raiseErrorMandatoryField(message) {

    return {
          code : 40421,
          httpStatus: 404,
          description: message,
          moreInfoURL: '/error/40421' 
        }
}


router.post('/car/:carId', function(req, res) {
   var car = req.body;
   var carId = req.params.carId;
   rest.postJson(constants.USER_API_END_POINT + 'car/' + carId, car, {headers : headers.traderHeader})
     .on('success', function(data, response) {
       return res.send(data)
     }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
   });
});

router.post('/:userId/addAddress', function(req, res) {

    var address = req.body;
    var userId = req.params.userId;
    rest.postJson(constants.USER_API_END_POINT + userId + '/addAddress', req.body, {headers : headers.traderHeader})
      .on('success', function(data, response) {
      return res.send(data)
    }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data) 
    });
});


router.get('/:userId/view', function(req, res) {
    var userId = req.params.userId;

     rest.get(constants.USER_API_END_POINT + userId + '/view', {headers : headers.traderHeader}).on('success', function(data, response){
       data.phone = utilPhones.formatPhone(data.phone)
       data.imageUrl = imageTransformer.getImageUserPath(userId, data.imageName, 200, 200)
       if (data.password)
         delete data.password
       return res.send(data);
     }).on('fail', function(data, response){
         winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
     });
});



router.get('/getAllInsurancesCompanies', function(req, res) {
  	 rest.get(constants.USER_API_END_POINT + 'getAllInsurancesCompanies', {headers : headers.traderHeader}).on('success', function(data, response){
       return res.send(data)
  	 }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
     });
});

router.get('/:userId/addresses', function(req, res) {
	 var userId = req.params.userId;

	 rest.get(constants.USER_API_END_POINT + userId + '/addresses', {headers: headers.traderHeader})
     .on('success', function(data, response) {
       return res.send(data)
     }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data) 
   });
});

router.post('/address/:addressId', function(req, res) {
    var address = req.body;
    var addressId = req.params.addressId;
    rest.postJson(constants.USER_API_END_POINT + 'address/' + addressId, req.body, {headers : headers.traderHeader})
      .on('success', function(data, response) {
      return res.send(data)
    }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
    });
});

router.delete('/address/:addressId', function(req, res) {
  rest.del(constants.USER_API_END_POINT + 'address/' + req.params.addressId, {headers : headers.traderHeader})
    .on('success', function (data, response) {
      res.send(data)
    })
    .on('fail', function (data, response) {
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
});

router.delete('/car/:carId', function(req, res) {
  rest.del(constants.USER_API_END_POINT + 'car/' + req.params.carId, {headers : headers.traderHeader})
    .on('success', function (data, response) {
      res.send(data)
    })
    .on('fail', function (data, response) {
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
});


router.get('/:userId/questions', function(req, res) {
  let page = req.query.page;
  rest.get(constants.USER_API_END_POINT + req.params.userId + '/questions?page=' + page, {headers : headers.traderHeader})
    .on('success', function(data, response){
      commentTransformer.processData(data)
      res.send(data)
    })
    .on('fail', function(data, response){
       winston.log('error', {data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
})

router.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  
  const params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  rest.post(accessTokenUrl, {data:params})
    .on('success', function(data, response) {

      rest.get(peopleApiUrl, {headers: { Authorization: 'Bearer ' +  data.access_token }})
        .on('success', function(data, response){

          let hasCommerce = req.body.hasCommerce;
          let isLogin = req.body.isLogin;
          let profile = {
            email: data.email,
            socialId: data.sub,
            nickName: data.given_name,
            imageName: data.picture.replace("Yf=s50", "Yf=s200")
          }
          
          if (isLogin) 
            return loginRedSocial(res, profile)
          else if (hasCommerce) 
            return userService.socialSignUp(res, profile, 'socialSignUpCommerce')
          else 
            return userService.socialSignUp(res, profile, 'socialSignUpUser')
          
        }).on('fail', function(data, response){
          winston.log('error', {data: data})
          console.log("error en peopleApiUrl: ")
          console.log(data)
          return res.send(data);
      });

    })
    .on('fail', function(data, response) {
       winston.log('error', {data: data})
      console.log("error accessTokenUrl: ")
      console.log(data)
      return res.send(data)
    })

})

router.post('/auth/facebook', function(req, res) {
  return loginRedSocial(res, req.body)
})

/*
router.post('/auth/twitter', function(req, res) {

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  var request = require('request')
  var qs = require('qs')


  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      callback: req.body.redirectUri
    };

    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      if(err) return res.status(400).send({data: "Ocurrió un error al obtener el token de autenticacion."})

      var oauthToken = qs.parse(body);
      res.send(oauthToken);

    });
  } else {

    var accessTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {
      if(err) return res.status(400).send({data: "Ocurrió un error al obtener el token de acceso."})

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: accessToken.oauth_token,
        token_secret: accessToken.oauth_token_secret,
      };

      request.get({ url: profileUrl, qs: { include_email: true }, oauth: profileOauth, json: true }, function(err, response, data) {
        if(err) return res.status(400).send({data: "error al final"})

        var profile = {
          email: data.email,
          socialId: data.id,
          nickName: data.name,
          image: data.profile_image_url
        }

        return loginRedSocial(res, profile)
      });
    });

  }
}) */

router.post('/:userId/data', multipartyMiddleware, function(req, res) {
  updateUserData(req, res, constants.USER_API_END_POINT + req.params.userId + '/data')
});

function updateUserData(req, res, endpoint){
    let data = JSON.parse(req.body.data)
    let file = req.files.file || null
    let userId = req.params.userId
    let dataFile = {}

    dataFile = processFile(file, dataFile)

    if(dataFile){
      data.imageName = dataFile.key
    }

    rest.postJson(endpoint, data, {headers : headers.traderHeader})
      .on('success', function(data, response) {
        
      if(dataFile) {
        let base = 'users/' + userId + '/'
        addBase(dataFile, base)
        clientS3.putFile(dataFile)
          .then(function(dataResp) {
           return res.send({
              nickName: data.nickName,
              email: data.email,
              imageUrl : imageTransformer.getImageUserPath(data.id, data.imageName),
            })
          })
          .catch(function(error) {
            return res.send({ error: error })
          })
      } else {
        return res.send({
              nickName: data.nickName,
              email: data.email,
              imageUrl : imageTransformer.getImageUserPath(data.id, data.imageName),
            })
      }

    }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data)
    });



    function addBase(dataFile, base) {
      dataFile.key = base + dataFile.key
    }

    function processFile(file, dataFile) {
      if(file){
        let key = generateKey(file.name)

        return {
          key: key,
          stream: fs.createReadStream(file.path)
        }
      }
    }


    function generateKey(fileName) {
      let extension = path.extname(fileName)
      const timestamp = (new Date()).getTime()
      const hash = require('crypto').createHash('md5').update(fileName + timestamp).digest("hex")
      return hash + extension.toLowerCase()
    }
}


function loginRedSocial(res, profile) {

  rest.postJson(constants.USER_API_END_POINT + 'socialLogin', profile, {headers: headers.traderHeader})
    .on('success', function(data, response){
      return res.send({token: createJWT({id: data.id}), userId: data.id, nickName: profile.nickName, imageUrl: profile.imageName, email: data.email, lastLogin: data.lastLogin});
    }).on('fail', function(data, response){
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data) 
  });
}

router.post('/save', multipartyMiddleware, function(req, res) {
  updateCommerceData(req, res, constants.COMMERCE_API_END_POINT + 'save?userId=' + req.query.userId)
});

router.post('/awsPresignedUrl', function(req, res) {
  clientS3.getPresignedUrl(
    req.body.bucket,
    req.body.key,
    req.body.type,
    (err, url) => {
      res.send({ url });
    });
});


router.post('/insurer/accident', function(req, res) {

    var dataJson = req.body
   
    rest.postJson(constants.USER_API_END_POINT + 'insurer/accident', req.body, {headers : headers.traderHeader})
      .on('success', function(data, response) {
      return res.send(data)
    }).on('fail', function(data, response) {
        winston.log('error', {data: data})
        if (data.httpStatus) return res.status(data.httpStatus).send(data)
        if (response.status) return res.status(response.status).send(data)
        return res.status(500).send(data) 
    })
})

module.exports = router;
