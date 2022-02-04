
/*
    Ruta : /api/tiempos_entrega
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getTiemposEntrega } = require('../controllers/tiempos_entrega');


const router = Router();

router.get('/', 
            //validarJWT, 
            getTiemposEntrega
);



module.exports = router;