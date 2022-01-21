
/*
    Ruta : /api/monedas
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getMonedas, getMonedaByID } = require('../controllers/monedas');


const router = Router();

router.get('/', 
            validarJWT, 
            getMonedas
);

router.get('/:id', 
            validarJWT,
            getMonedaByID 
);

module.exports = router;