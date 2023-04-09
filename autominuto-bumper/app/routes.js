const status    = require('./status')
const limiter   = require('./limiters')
const _         = require('underscore')
const config    = require('./config')
const express   = require('express')

module.exports = (app) => {

  // Public routes
  app.use('/api', limiter)

  app.use('/api/user', require('./routes/user'))
  app.use('/api/home', require('./routes/home'))
  app.use('/api/commerce', require('./routes/commerce'))
  app.use('/api/quote', require('./routes/quote'))
  app.use('/api/search', require('./routes/search'))
  app.use('/api/comment', require('./routes/comment'))
  app.use('/api/contact', require('./routes/contact'))
  app.use('/api/product', require('./routes/product'))
  app.use('/api/coupon', require('./routes/coupon'))
  app.use('/api/favorite', require('./routes/favorite'))
  app.use('/api/payment', require('./routes/payment'))
  app.use('/api/subscription', require('./routes/subscription'))
  app.use('/api/recommendation', require('./routes/recommendation'))
  app.use('/api/notification', require('./routes/notification'))
  app.use('/api/mercadopago', require('./routes/mercadopago'))
  app.use('/api/whatsapp', require('./routes/whatsapp'))
  app.use('/api/serviceType', require('./routes/serviceType'))
  app.use('/api/commerceType', require('./routes/commerceType'))

  // Protected routes
  // app.use(require('./middle/authentication'));

  //app.use('/view', require('./routes/view'));
  app.get('/terminos-condiciones', require('./routes/views').terms)
  app.get('/terminos-condiciones-profesionales', require('./routes/views').termsCommerce)
  app.get('/seguridad', require('./routes/views').security)
  app.get('/politicas-privacidad', require('./routes/views').privacy)
  app.get('/politicas-suspension-usuario', require('./routes/views').termsUserSuspend)
  app.get('/re', require('./routes/views').recommendation)
  app.post('/print-coupon', require('./routes/views').printCoupon)
  app.post('/print-voucher', require('./routes/views').printVoucher)
  app.post('/print-voucher-product', require('./routes/views').printVoucherProduct)


  app.get("/blog", (req, res) => {
    res.status(301).redirect("https://blog.autominuto.com")
  })


  app.get("/blog/*", (req, res) => {
    if (req.path.includes("wp-content")){
      return res.status(301).redirect("https://s3-sa-east-1.amazonaws.com/autominuto-blog" + req.path.replace("/blog", ""))
    }

    return res.status(301).redirect("https://blog.autominuto.com" + req.path.replace("/blog", ""))
  })

  app.get('/*', (req, res) => {

    if ((!req.headers.host.match(/^www/) && !req.headers.host.match(/8082/) && !req.headers.host.match(/testing/))
        || req.headers.host.match(/.com.ar:?\d*$/)
    )  {
      res.redirect('https://www.autominuto.com' + req.url);
    } else {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.status(200);
      if (req.url === '/') {
        res.sendFile('home/home.html', { root: './static' });
      } else {
        res.sendFile('index.html', { root: './public' });
      }
    }
  })

  // Not found
  app.use((req, res) => {
    res.dispatch(status.NOT_FOUND);
  });
};
