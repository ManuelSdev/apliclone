'use strict';

const readLine = require('readline');

const utils = {

  askUser(question) {
    return new Promise((resolve) => {
      const rl = readLine.createInterface({
        input: process.stdin, output: process.stdout
      });
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  },

  buildAdFilterFromReq(req) {
    const filters = {};
    //********************KEYWORDS********************* */
    // i = bandera que no distingue mayúsculas de minúsculas
    //
    /**
     * Necesitaba crear dos claves (name y description, una para cada
     * campo en el que buscaba) en filters{}
     * y hacer busquedas con $or porque no tenia índices COMPUESTOS
     * Necesitaba esto:
     * filters.name = new RegExp(req.query.keywords, 'i');
     * filters.description = new RegExp(req.query.keywords, 'i');
     * Al haber creado índices COMPUESTOS en Advert.js con esto:
     * advertSchema.index({ name: 'text', description: 'text' });
     * Puedo hacer busquedas con $text y pilla todos los campos con 
     * "segundo" índice "text" sin importar el nombre del campo.
     * "text" incluye, por defecto, config para obviar min/may y 
     * diacríticos.
     * Ahora, lo encuentro todo con lo esto de abajo...muajajajaja
     */
    /**
     * Si no hago este filtro y la el input de busqueda está vacío, el 
     * valor de keywords sera ="", que es el valor por defecto del objeto
     * de estado del formulario del front
     * Entonces, si es ="", filtrará documentos cuyo nombre o descripción
     * sea un string vacío...=""...y la consulta no devolverá nada
     */
    if (req.query.keywords !== ''
      //RECUERDA: undefined con igualdad estricta tambíen pilla el null...y con typeof evita lanzar error si la var no está declarada
      && typeof req.query.keywords !== 'undefined') {
      filters.$text = {}
      filters.$text.$search = req.query.keywords
    }

    /*
        if (req.query.tag) {
          filters.tags = { $in: req.query.tag };
        }
    
        if (typeof req.query.venta !== 'undefined') {
          filters.venta = req.query.venta;
        }
    */
    if (typeof req.query.price !== 'undefined' && req.query.price !== '') {
      if (req.query.price.indexOf(',') !== -1) {
        filters.price = {};
        let range = req.query.price.split(',');
        if (range[0] !== '') {
          filters.price.$gte = range[0];
        }

        if (range[1] !== '') {
          filters.price.$lte = range[1];
        }
      } else {
        filters.price = req.query.price;
      }
    }
    /*
        if (typeof req.query.nombre !== 'undefined') {
          filters.nombre = new RegExp('^' + req.query.nombre, 'i');
        }
    */
    return filters;
  }

};

module.exports = utils;