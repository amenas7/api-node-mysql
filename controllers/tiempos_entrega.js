const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todas los tiempos de entrega
// ==========================================
const getTiemposEntrega = (req, res) => {
    consql.query(` select 
    tiempo_entrega_ID, descripcion
    from tiempo_entrega`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando tiempos de entrega',
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



module.exports = {
    getTiemposEntrega
}