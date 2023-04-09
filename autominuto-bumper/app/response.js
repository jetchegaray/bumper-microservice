module.exports = (req, res, next) => {

  res.dispatch = function(status, message, content) {
    status = status || 500;
    message = message || defaultMessage(status);
    if (typeof content === 'undefined')
      content = null;

    this.status(status)
      .json({
        message: message,
        content: content
      });
  };

  function defaultMessage(status) {
    switch (status) {
      case 200: return "";
      case 201: return "";
      case 400: return "Parameter invalid or missing";
      case 401: return "Unauthorized";
      case 403: return "Not allowed";
      case 404: return "Not found";
      case 429: return "Too many requests";
      case 500: return "Something went wrong";
      case 501: return "Not implemented";
    }
  }

  next();
};
