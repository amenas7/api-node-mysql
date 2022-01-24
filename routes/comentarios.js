
/*
    Ruta : /api/comentarios
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { 
    getComentarios, getComentariosByID, crearComentario, borrarComentario } = require('../controllers/comentarios');


const router = Router();

router.get('/', 
            validarJWT, 
            getComentarios
);

router.get('/:id', 
            validarJWT,
            getComentariosByID 
);

router.post('/', 
            [
                //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
                //check('password', 'El password es obligatorio').not().isEmpty(),
                //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
                //validarCampos,
            ],
            crearComentario 
);

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

router.delete('/:id', 
            //validarJWT,
            borrarComentario
);

module.exports = router;