
/*
    Ruta : /api/forma_pago
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getFormasPago } = require('../controllers/formas_pago');


const router = Router();

router.get('/', 
            //validarJWT, 
            getFormasPago
);



module.exports = router;