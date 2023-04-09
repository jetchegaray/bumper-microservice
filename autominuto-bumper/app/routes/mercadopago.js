const constants = require("../utils/constants");
const config = require("../config");
const express = require("express");
const router = express.Router();
const paymentProcessor = require("../service/paymentProcessor");
const paymentService = require("../service/paymentService");
const mercadopagoService = require("../service/mercadopagoService");
const winston = require("winston");

router.get("/authorization-mp-url", (req, res) => {
  const commerceId = req.query.commerceId;
  const authorizationUrl = mercadopagoService.getUrlAuthorization(commerceId);
  winston.log("info", "AuthorizationMPUrl: " + authorizationUrl);
  res.send(authorizationUrl);
});

router.get("/authorization", (req, res) => {
  const { code, commerceId } = req.query;
  mercadopagoService
    .processAuthorization(code, commerceId)
    .then(() =>
      res.redirect(
        constants.MERCADOPAGO.SUCCESS_URL.replace("{commerceId}", commerceId)
      )
    )
    .catch(({ data, response }) => {
      if (response.status) return res.status(response.status).send(data);
      return res.status(500).send(data);
    });
});

router.post("/notifications", async (req, res) => {
  const type = req.query.type;
  const accountId = req.body.user_id;
  const resourceId = req.body.data ? req.body.data.id : req.body.id;
  winston.info("Notification MercadoPago Type:", type);
  winston.info("Body:", JSON.stringify(req.body));

  //TYPE TEST
  if (type == "test") return res.sendStatus(200);

  let accessToken;
  if (accountId.toString() !== config.MERCADOPAGO_AM_USER_ID) {
    try {
      const commerceAccount = await paymentService.findCommerceByAccountId(
        accountId
      );
      accessToken = commerceAccount.accessToken;
    } catch (err) {
      winston.error(err);
      res.status(500).send(err);
    }
  }

  mercadopagoService
    .getOrderByResource(type, resourceId, accessToken)
    .then(paymentProcessor.process)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      winston.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
