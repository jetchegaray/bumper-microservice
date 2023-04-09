const MP 	= require("mercadopago"),
      config = require('../config');

const mp = new MP(config.MERCADOPAGO_CLIENT_ID, config.MERCADOPAGO_SECRET);

module.exports = {
  getPayments: function(){
    return mp.get({
      "uri": "/v1/payment_methods",
      "authenticate": true
    })
  },
  createSubscription: function(data){
    return mp.createPreapprovalPayment(data)
  },
  createPayment: function(data){
    return mp.createPreference(data)
  },
  getClientMP: function(){
    return mp
  }
}
