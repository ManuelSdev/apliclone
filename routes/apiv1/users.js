'use strict';

var express = require('express');
var router = express.Router();
const { User } = require('../../models')
const jwt = require('jsonwebtoken')
const jwtAuth = require('../../lib/jwtAuth')



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
        if (!email) {
            console.log('jkakah')
            const error = new Error('invalid credentials');
            error.status = 401;
            next(error);
        }
        // console.log(req.body)
        // buscar el usuario en la BD
        const user = await User.findOne({ email })
        // si no lo encontramos --> error
        // si no coincide la clave --> error
        if (!user || !(await user.comparePassword(password))) {
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
        jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' }, (err, accessToken) => {
            if (err) {
                next(err);
                return;
            }
            // devolveselo al cliente
            //al poner solo la clave del objeto, el valor toma el mismo nombre, que es la variable accesToken de que pasa a la callback de arriba
            res.json({ accessToken });
        });
    } catch (err) {
        next(err);
    }
})

/**Obtener objeto con id´s de anuncios favoritos */
router.get('/fav', jwtAuth, async function (req, res, next) {
    try {
        const _id = req.body.userId;
        const user = await User.findById(_id)
        res.json(user.favorites)

    } catch (err) { next(err) }

})

/**Actualizar favoritos */
router.put('/:adId', jwtAuth, async function (req, res, next) {
    try {
        // console.log("req que llega", req.body)
        const _id = req.body.userId;
        const adId = req.params.adId
        //console.log("param", adId)
        const action = req.body.action
        //console.log("ACTION", action)
        const updatedUser = action === 'push' ?
            await User.findByIdAndUpdate(_id, { '$push': { "favorites": adId } }, {
                new: true,
                useFindAndModify: false
            })
            :
            await User.findByIdAndUpdate(_id, { '$pull': { "favorites": adId } }, {
                new: true,
                useFindAndModify: false
            })
        //console.log("updated", updatedUser)
        res.json(updatedUser.favorites)

    } catch (err) { next(err) }

})

/**Añadir/quitar un id de anuncio favorito  */
router.post('/fav', jwtAuth, async function (req, res, next) {
    try {
        const _id = req.body.userId;
        const adId = req.body.adId;

        /*
        const favKey = `favorites.${adId}`
        const updateObjetc = {
            [favKey]: adId
        }
        */
        const user = await User.findById(_id)
        user.checkFavoriteElement(adId) ?
            user.deleteFavoriteElement(adId)
            :
            user.addFavoriteElement(adId)

        //user.prin(adId)
        const updateObjetc = {
            'favorites': user.favorites
        }
        await User.findByIdAndUpdate(_id, updateObjetc)
        console.log("USER  ", user)
        res.json(user.favorites)

    } catch (err) { next(err) }

})


/**Logout de usuario */


module.exports = router;