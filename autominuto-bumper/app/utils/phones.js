const _ = require('underscore')

module.exports = {

  formatPhone: function(phone) {

    if (!phone.number)
        return {}

    let rawPrefixNumber = (phone.number.match(/\(([^)]+)\)/)) ? phone.number.match(/\(([^)]+)\)/).pop() : phone.areaCode //remueve paréntesis o utiliza prefijo que viene del servicio
    let rawPhoneNumber = (phone.number.indexOf(rawPrefixNumber) === 0) ? phone.number.replace(rawPrefixNumber, '') : phone.number //remueve el prefijo del teléfono
    
    let phoneNumber = rawPhoneNumber.replace(/\s*\(.*?\)\s*/g, '')
    let prefixNumber = (rawPrefixNumber && rawPrefixNumber.match(/^[0]{1}[0-9]*$/)) ? rawPrefixNumber.slice(1, rawPrefixNumber.length) : rawPrefixNumber //remueve 0 delante, si lo encuentra

    return {
        printNumber: /*phone.countryCodeNumber + */ (prefixNumber ? ' (' + prefixNumber + ') ' : ' ') + phoneNumber,
        areaCode: prefixNumber,
        number: phoneNumber,
        cellPhone: phone.cellPhone,
        countryCodeNumber: phone.countryCodeNumber,
        acceptWhatsapp: phone.acceptWhatsapp,
        acceptMessages: phone.acceptMessages
    }
  },

  formatPhones: function(phones) {
    let newPhones = []
    
    _.each(phones, (phone) => {
        newPhones.push(this.formatPhone(phone))
    })

    return newPhones
  }  
}


//AGREGAR ESTO
//if (phone.number.charAt(0) === '9') {


