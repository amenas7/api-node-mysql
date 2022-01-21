
/*
    Ruta : /api/almacenes
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getAlmacenes, getAlmacenByID } = require('../controllers/almacenes');


const router = Router();

router.get('/', 
            validarJWT, 
            getAlmacenes
);

router.get('/:id', 
            validarJWT,
            getAlmacenByID 
);

module.exports = router;