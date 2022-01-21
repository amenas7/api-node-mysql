const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los proveedores
// ==========================================
const getProveedores = (req, res) => {
    consql.query(` SELECT *
    from proveedor
    ORDER BY proveedorID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando proveedores',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                data: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// obtener un proveedor por el ID
// ==========================================
const getProveedorByID = (req, res) => {
    const id = req.params.id;

    consql.query(` SELECT *
    from proveedor
    where proveedorID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe una proveedor con el parametro buscado'
                })
            }
            else{
               return res.status(200).json({
                    ok: true,
                    data: filas,
                    uid: req.uid
                }) 
            }

        } catch (error) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando proveedores',
                error: err
            })
        }

    });
}



module.exports = {
    getProveedores,
    getProveedorByID
}