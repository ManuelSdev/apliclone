'use strict';

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // recoger el jwtToken de la cabecera (o de otros sitios)
  const jwtToken = req.get('Authorization') || req.query.token || req.body.token;

  // comprobar que tengo token
  if (!jwtToken) {
    const error = new Error('no token provided');
    error.status = 401;
    //console.log(error)
    next(error);
    return;
  }

  // comprobar que el token es valido
  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      err.status = 401;
      //console.log(error)
      next(err);
      return;
    }
    console.log("PAYLOAD ", payload)
    console.log("USER ID QUE METE jwtAuth ", payload._id)
    req.body.userId = payload._id;
    console.log("+++++++++++++++++++++++++++++++++++++++", req.body.userId)
    next();
  });

};
