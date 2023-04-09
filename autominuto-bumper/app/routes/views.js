const config = require('../config')
const commerceService = require('../service/commerceService')
const winston     = require('winston')
const moment = require('moment')

const convertDays = {
  'monday': 'Lunes',
  'tuesday': 'Martes',
  'wednesday': 'Miercoles',
  'thursday': 'Jueves',
  'friday': 'Viernes',
  'saturday': 'Sabado',
  'sunday': 'Domingo',
  'holiday': 'Feriados'
}

exports.terms = (req, res) => {
  const host = config.HOST
  res.render('terms',{host})
}

exports.termsCommerce = (req, res) => {
  const host = config.HOST
  res.render('termsCommerce',{host})
}

exports.security = (req, res) => {
  const host = config.HOST
  res.render('security',{host})
}

exports.privacy = (req, res) => {
  const host = config.HOST
  res.render('privacy',{host})
}

exports.termsUserSuspend = (req, res) => {
  const host = config.HOST
  res.render('termsUserSuspend',{host})
}

exports.recommendation = (req, res) => {
  const userAgent = req.headers['user-agent']
  if (userAgent.includes("facebookexternalhit/") || userAgent.includes("Facebot")) {
    const businessName = req.query.businessName || ''
    const host = config.ENV === 'development' ? config.SOCIAL_RECOMMENDATION_URL : config.HOST
    res.render('recommendation', {businessName, host})
  } else {
    const redirectUrl = `/comercio/${req.query.commerceId}/recomendacion`
    res.redirect(redirectUrl)
  }
}

exports.printCoupon = (req, res) => {
  const coupon = req.body
  const host = config.HOST
  commerceService.findByCommerceId(coupon.commerceId)
    .then(commerce => {
      const treeAlias = calculateTreeAlias(coupon)
      res.render('coupon-user', {coupon, host, commerce, convertDays, treeAlias})
    })
    .catch(({data, response}) => {
      winston.error({data: data})
      if (data.httpStatus) return res.status(data.httpStatus).send(data)
      if (response.status) return res.status(response.status).send(data)
      return res.status(500).send(data)
    })
}

exports.printVoucher = (req, res) => {
  const budget = req.body
  const formattedAppointments = formatPossibleAppointments(budget.replies[0].possibleAppointments)
  const id = generateVoucherId()
  const host = config.HOST
  commerceService.findByCommerceId(budget.replies[0].commerce.id).then(commerce => {
    res.render('voucher', {budget, commerce, formattedAppointments, convertDays, id, host})
  })
}

exports.printVoucherProduct = (req, res) => {
  const bought = req.body
  const id = generateVoucherId()
  const host = config.HOST
  
  res.render('voucherProduct', {bought, convertDays, id, host})
}

const calculateTreeAlias = (coupon) => {
  let category = coupon.categories[0]
  let treeAlias = category.alias
  if(category.childrens && category.childrens.length) {
    let secondLevel = category.childrens[0]
    if(secondLevel.childrens && secondLevel.childrens.length) {
      const alias = secondLevel.childrens[0].alias
      treeAlias = treeAlias.concat(" - " + secondLevel.alias + " - ").concat(alias)
    } else {
      treeAlias = treeAlias.concat(" - " + secondLevel.alias)
    }
  }
  return treeAlias
}

const formatPossibleAppointments = possibleAppointments =>
  possibleAppointments.map(({date}) =>
    moment(date, 'DD-MM-YYYY HH:mm').locale('es').format('DD MMMM. HH:mm').concat('hs'))

const generateVoucherId = () => {
  let id = ''
  const values = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let index = 0; index < 16; index++) {
    id += values.charAt(Math.floor(Math.random() * values.length));
  }

  return id
}
