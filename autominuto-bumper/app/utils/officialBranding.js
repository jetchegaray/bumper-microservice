const utilWorkingHours = require('../utils/workingHours')
const imageTransformer = require('../utils/imageTransformer')

module.exports = {
  generateOfficialBranding: function (officialBranding) {
    const r = []

    officialBranding.forEach(c => {

      let logo = c.images.find(i => i.logo === true)
      const price = c.products ? minNumber(c.products) : 0

      const products = c.products.map(item => {
        const img = item.images.find(img => img.main)
        return {
          name: item.name,
          image: imageTransformer.getImageProductPath(item.id, img.name , 40, 68),
          price: item.price
        }
      })

      r.push({
        id: c.id,
        name: c.name,
        description: c.description,
        official: c.serviceBrandOfficial || c.sparePartsOfficial,
        workingTime: c.workingTime,
        logo: imageTransformer.getImageCommercePath(c.id, logo, 70, 70),
        validated: c.validated,
        grade: c.typeCommerceQuality,
        price: price ? price : 0,
        stars: c.totalRating ? c.totalRating : 1,
        coupons: c.coupons,
        products: products,
        location: c.location || "",
        isOpen: utilWorkingHours.isCommerceOpen(c.workingHours),
      })
    })

    return r
  }
}

function minNumber(array) {
  if (array.length === 0) return 0
  let min = array[0].price
  for (let i = 0; i < array.length; i++) {
    if (array[i] < array[min]) min = i
  }
  return min
}
