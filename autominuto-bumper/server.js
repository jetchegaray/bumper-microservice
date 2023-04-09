const newrelic        = require('newrelic')
const express         = require('express')
const path            = require('path')
const bodyParser      = require('body-parser')
const cluster         = require('express-cluster')
const swaggerUi       = require('swagger-ui-express')
const app             = express()
const status          = require('./app/status')
const config          = require('./app/config')
const winston         = require('winston')
const cors            = require('cors')
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
const compression     = require('compression')
var   prerenderio     = require('prerender-node')

const https           = require('https')
var fs                = require('fs');
const port            = 8082

const clusterConfig = {
  count: config.WEB_CONCURRENCY,
  verbose: config.ENV === 'development'
};

cluster(clusterConfig, worker => {

// Start server http
   const server = app.listen(config.PORT, () => {
     console.log(`Worker ${worker.process.pid} running on port ${server.address().port}`);
   });

// Start server https
 /* const httpsOptions = {
    key: fs.readFileSync('./security/key.pem'),
    cert: fs.readFileSync('./security/cert.pem')
  }

   const server = https.createServer(httpsOptions, app)
   .listen(port, () => {
      console.log('server running at ' + port)
   })
*/
  // Logger
  const fileTransport = new (winston.transports.File)({ filename: 'server.log' })
  const consoleTransport = new (winston.transports.Console)()
  winston.configure({transports: [fileTransport, consoleTransport]});
  winston.handleExceptions([fileTransport, consoleTransport]);

  // Set global middleware
  app.disable('x-powered-by');
  app.enable('trust proxy');

  app.use(bodyParser.json({limit:'50mb'}));
  app.use(bodyParser.urlencoded({ extended: false, limit:'50mb'}));

  app.use(express.static(path.join(__dirname, '/public/export')));

  //prerender.io
  app.use(prerenderio.set('prerenderToken', config.PRERENDER_TOKEN));

  // Cors
  app.use(cors());

  // compress responses
  app.use(compression())

  //https
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  app.locals.moment = require('moment')

  // Set response object
  app.use(require('./app/response'));

  // Documentation
  if (config.ENV === 'development')
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(require('./doc/swagger.json')));

  // Views
  app.set('view engine', 'pug');
  app.set('views', __dirname + '/app/views');

  // Routes
  require('./app/routes')(app);

  // Error handling
  app.use(function(err, req, res, next) {
    let stack = null;
    let message = null;

    if (config.ENV === 'development') {
      if (err instanceof Error) {
        message = err.message;
        stack = err.stack.split("\n");
      } else if (typeof err !== 'object' && typeof err !== 'function')  {
        message = err
      }
    }

    winston.log('error', {data: err})

    res.dispatch(err.status || status.SERVER_ERROR, message, stack);
  });

});


module.exports = app;
