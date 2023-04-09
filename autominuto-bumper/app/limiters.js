const RateLimit = require('express-rate-limit');

const status = require('./status');

/**
 * @api {get} /user/id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
module.exports = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  delayMs: 500,
  delayAfter: 50,
  handler: function (req, res) {
    res.dispatch(status.TOO_MANY_REQUESTS);
  }
});
