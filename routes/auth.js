
/*
    Ruta : /api/login
*/

const { Router } = require('express');
const { check } = require ('express-validator');

/* middlewares  */
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

/* controladores */
const { login, renewToken } = require('../controllers/auth');


const router = Router();

router.post('/', 
    [
        check('usuario', 'El usuario es obligatorio').not().isEmpty(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        validarCampos,
    ],
    login 
);


router.get('/renew',
    validarJWT,
    renewToken 
);


module.exports = router;