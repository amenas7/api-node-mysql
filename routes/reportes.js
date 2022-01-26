const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');


const { 
    getReporteByID } = require('../controllers/reportes');

const router = Router();

router.get('/:id', 
            //validarJWT, 
            getReporteByID
);

// router.post('/', 
//             //validarJWT,
//             cargaArchivo 
// );

// router.put('/:id', 
//             [    //validarJWT,
//                  //check('nombres', 'El nombre es obligatorio').not().isEmpty(),
//                  //check('role', 'El role es obligatorio').not().isEmpty(),
//                  //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             //validarJWT,
//             borrarArchivo 
// );

// router.delete('/:id', 
//             //validarJWT,
//             borrarArchivo
// );

module.exports = router;