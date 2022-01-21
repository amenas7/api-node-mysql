const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los items
// ==========================================
const getItems = (req, res) => {
    consql.query(` SELECT *
    from item
    ORDER BY itemID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando items',
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
// obtener un item por el ID
// ==========================================
const getItemByID = (req, res) => {
    const id = req.params.id;

    consql.query(` SELECT *
    from item
    where itemID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un item con el parametro buscado'
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
                mensaje: 'Error cargando item',
                error: err
            })
        }

    });
}



module.exports = {
    getItems,
    getItemByID
}