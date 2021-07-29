'use strict';

var express = require('express');
var router = express.Router();
const { User } = require('../../models')
const jwt = require('jsonwebtoken')

//const Advert = require('../../models/Advert');

/**TODO
 * CAMBIA USUARIO POR USER
 */

router.post('/', async function (req, res, next) {
    try {

        /****TODO
         * METER LOGIN POR USUARIO O EMAIL ELEGIR
         * USA CONDICIONAL PARA VER CUAL DE LOS DOS VIENE EN LA REQ
         * 
         * MANTENER EL EMAIL PASANDOLO AL CLIENTE PAG 68
         * 
         * REFINA LOS IF QUE AHORA NO TIENEN SENTIDO
         */
        const { email, password } = req.body;
        // console.log(req.body)
        // buscar el usuario en la BD
        const usuario = await User.findOne({ email })
        // si no lo encontramos --> error
        // si no coincide la clave --> error
        if (!usuario || !(await usuario.comparePassword(password))) {
            if (!usuario) {
                console.log('usuario')
            }
            if (!(await usuario.comparePassword(password))) {
                console.log('usuario')
            }
            const error = new Error('invalid credentials');
            error.status = 401;
            next(error);
            return;
        }
        // si el usuario existe y la clave coincide
        // crear un token JWT (firmado)
        jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, jwtToken) => {
            if (err) {
                next(err);
                return;
            }
            // devolveselo al cliente
            res.json({ token: jwtToken });
        });

    } catch (err) {
        next(err);
    }

})

module.exports = router;