const jwt = require('jwt-simple')
const config = require('../config')

const validateToken = (req, res, next) => {
  const authorizationHeader = req.get('authorization')
  if (authorizationHeader) {
    const encodedToken = authorizationHeader.replace('Bearer ', '')
    try {
      //Si no falla en hacer el decode, significa que es valido y no esta vencido
      jwt.decode(encodedToken, config.TOKEN_SECRET)
      next()
    } catch (error) {
      returnStatus401(res, 'Invalid Token')
    }
  } else {
    returnStatus401(res, 'Missing token')
  }
}

const returnStatus401 = (res, message) => res.status(401).json({error: message})

module.exports = {
  validateToken
}
