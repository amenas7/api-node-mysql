const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// modificar estado de autorizacion
// ==========================================
const actualizarAutorizacion = async(req, res = response) => {
    const id = req.params.id;

    const p_estado = req.body.estado;

    const obtenerReg = await consultar_existe_compra(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error orden de compra no encontrada'
        })
    }

    const p_dos_actualizar_estado_compra = await dos_actualizar_estado_compra(p_estado, res, id);

    if ( p_dos_actualizar_estado_compra.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se modificó el estado de la orden de compra'
        });
    }

    return res.status(200).json({
        ok: true,
        mensaje: "Autorizacion modificada"
    });

 };

 function consultar_existe_compra(req, res, id) {
    const query = `
    select count(compraID) as cantidad from compra
    where compraID = "${id}" `;

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['cantidad']);
        });
    });
}



function dos_actualizar_estado_compra(p_estado, res, id) {
    const p_idc = id;
    const estado = p_estado;

    // modificar el estado de la autorizacion
    const query = `
    UPDATE compra
    SET estado_autorizacion = "${estado}" 
    WHERE compraID = "${p_idc}"
    `;

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                console.log("Error: " + err.message);
                throw err;
            }
            resolve(rows);
        });
    });
}

module.exports = {
    actualizarAutorizacion
}