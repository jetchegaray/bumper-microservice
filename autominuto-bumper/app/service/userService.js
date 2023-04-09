const rest              = require('restler');
const constants         = require('../utils/constants');
const headers           = require('../utils/headers');
const imageTransformer  = require('../utils/imageTransformer')
const moment            = require('moment')
const config            = require('../config')
const jwt               = require('jwt-simple')
const winston           = require('winston')
const _                 = require('underscore')

exports.socialSignUp = (res, profile, url) => {
  return new Promise((resolve, reject) => {
    rest.postJson(constants.USER_API_END_POINT + url, profile, {headers : headers.traderHeader})
        .on('success', function(data, response){
            return res.send({token: createJWT({id: data.id}), userId: data.id, nickName: profile.nickName, imageUrl: profile.imageName, email: data.email, lastLogin: data.lastLogin});
        })     
         .on('fail', function(data, response){
            winston.log('error', {data: data})
            if (data.httpStatus) return res.status(data.httpStatus).send(data)
            if (response.status) return res.status(response.status).send(data)
            return res.status(500).send(data);
         })
  })
}


function createJWT(user) {
    var payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(constants.MAX_DAYS, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}