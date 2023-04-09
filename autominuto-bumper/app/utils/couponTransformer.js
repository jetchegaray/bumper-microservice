const moment    = require('moment')
const imageTransformer = require('../utils/imageTransformer')

module.exports = {
  addExtraInformationToCoupon : function (coupon, commerceId) {
    if(coupon.discountPercentage) {
      coupon.discount = coupon.discountPercentage
    } else {
      let discount = ((coupon.price - coupon.discountFixed) / coupon.price) *100
      discount = Math.round(discount)
      coupon.discount = discount
    }

    coupon.isPack = coupon.services.length > 1

    let validTo = moment(coupon.validTo,'DD-MM-YYYY HH:mm').format('DD-MM-YYYY')
    let today = moment().format('DD-MM-YYYY')
    today = moment(today, 'DD-MM-YYYY')
    coupon.expireToday = today.isSame(moment(validTo, 'DD-MM-YYYY'))

    coupon.imagePath = (coupon.image !== null) ? imageTransformer.getCouponImagePath(coupon, commerceId) : null
  },

  addExtraInformationToCouponSummary : function (coupon, commerceId) {
    if(coupon.discountPercentage) {
      coupon.discount = coupon.discountPercentage
    } else {
      let discount = ((coupon.price - coupon.discountFixed) / coupon.price) *100
      discount = Math.round(discount)
      coupon.discount = discount
    }

    coupon.imagePath = (coupon.image !== null) ? imageTransformer.getCouponImagePath(coupon, commerceId) : null
  }
}
