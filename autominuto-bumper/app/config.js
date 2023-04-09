module.exports = {
  HOST: process.env.HOST || "http://localhost:8082",
  SOCIAL_RECOMMENDATION_URL: "https://www.autominuto.com",
  PORT: process.env.PORT || "8082",
  ENV: process.env.NODE_ENV || "development",
  WEB_CONCURRENCY: process.env.WEB_CONCURRENCY || 4,
  TOKEN_SECRET: process.env.TOKEN_SECRET || "tokenDesarrolloDeAutominuto",
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || "googleSecret",
  LIVE_SECRET: process.env.LIVE_SECRET || "liveSecret",
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || "facebookSecret",
  TWITTER_KEY: process.env.TWITTER_KEY || "twitterKey",
  TWITTER_SECRET: process.env.TWITTER_SECRET || "twitterSecret",
  MERCADOPAGO_AM_USER_ID: process.env.MERCADOPAGO_AM_USER_ID || "amd_user_id",
  MERCADOPAGO_CLIENT_ID:
    process.env.MERCADOPAGO_CLIENT_ID || "mercado_client_id",
  MERCADOPAGO_SECRET: process.env.MERCADOPAGO_SECRET || "mercado_secret",
  MERCADOPAGO_ACCESS_TOKEN:
    process.env.MERCADOPAGO_ACCESS_TOKEN || "access_token",
  PRERENDER_TOKEN: process.env.PRERENDER_TOKEN || "prerender_token",
  USER_INACTIVE_BANNER_EXPIRATION: 30,
  S3_BUCKET: "autominuto-testing",
};
