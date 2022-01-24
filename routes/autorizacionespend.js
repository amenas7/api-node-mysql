
/*
    Ruta : /api/autorizacionespend
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getOComprasTodasPendientes } = require('../controllers/autorizacionespend');


const router = Router();

router.get('/', 
            validarJWT, 
            getOComprasTodasPendientes
);

// router.get('/:id', 
//             validarJWT,
//             getOCompraByID 
// );

// router.post('/', 
//             [
//                 //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
//                 //check('password', 'El password es obligatorio').not().isEmpty(),
//                 //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             crearOCompra 
// );

// router.put('/:id', 
//             [    //validarJWT,
//                  //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
//                  //check('role', 'El role es obligatorio').not().isEmpty(),
//                  //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             //validarJWT,
//             actualizarOcompra 
// );

// router.delete('/:id', 
//             //validarJWT,
//             borrarOcompra
// );

module.exports = router;