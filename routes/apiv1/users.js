'use strict';

var express = require('express');
var router = express.Router();
const { User } = require('../../models')
const jwt = require('jsonwebtoken')


router.get('/', async function (req, res, next) {
    try {
        const query = await User.find({})
        // res.send(query)
        res.json({ ok: true, result: query });
    } catch (err) { next(err) }
    //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);

    //console.log(query)
})

/**Registrar usuario */
router.post('/register', async function (req, res, next) {
    try {
        //console.log(`El usuario que hace esta petición es ${req.apiAuthUserId}`);
        //await res.send('hola')
        console.log(req.body)
        const newUser = new User(req.body)
        newUser.password = await User.hashPassword(req.body.password)
        const saved = await newUser.save()
        await newUser.sendRegisterMail('Este es el asunto', 'Bienvenido a NodeAPI');
        res.json({ ok: true, result: saved })
    } catch (err) { next(err) }

})

/**Login de usuario */
router.post('/login', async function (req, res, next) {
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
        const user = await User.findOne({ email })
        // si no lo encontramos --> error
        // si no coincide la clave --> error
        if (!user || !(await usuario.comparePassword(password))) {
            if (!user) {
                console.log('usuario')
            }
            if (!(await user.comparePassword(password))) {
                console.log('usuario')
            }
            const error = new Error('invalid credentials');
            error.status = 401;
            next(error);
            return;
        }
        // si el usuario existe y la clave coincide
        // crear un token JWT (firmado)
        jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, jwtToken) => {
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

/**Logout de usuario */


module.exports = router;