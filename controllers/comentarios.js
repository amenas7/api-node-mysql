const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los comentarios
// ==========================================
const getComentarios = (req, res) => {
    consql.query(` select 
    co.comentarioID, co.compraID, co.descripcion, date_format(co.fecha_reg, "%d-%m-%Y") as fecha, TIME_FORMAT(co.fecha_reg, "%r") as hora,
    p.nombrecompleto as registrado_por
    from comentario co
    inner join usuario u
    on u.usuarioID = co.registradoPorID
    inner join persona p
    on p.IDpersona = u.IDpersona
    ORDER BY co.comentarioID DESC `, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando comentarios',
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

// ====================================================
// obtener comentarios por el ID de orden de compra
// ====================================================
const getComentariosByID = (req, res) => {
    const id = req.params.id;

    consql.query(` select 
    co.comentarioID, co.compraID, co.descripcion, date_format(co.fecha_reg, "%d-%m-%Y") as fecha, TIME_FORMAT(co.fecha_reg, "%r") as hora,
    p.nombrecompleto as registrado_por
    from comentario co
    inner join usuario u
    on u.usuarioID = co.registradoPorID
    inner join persona p
    on p.IDpersona = u.IDpersona
	where co.compraID = "${id}" 
    ORDER BY co.comentarioID DESC `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un comentario con el parametro buscado'
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
                mensaje: 'Error cargando comentarios',
                error: err
            })
        }

    });
}


// ==========================================
// crear un comentario
// ==========================================
const crearComentario = async(req, res) => {

    const p_compraID = req.body.compraID;
    const p_descripcion = req.body.descripcion;
    const p_registradoPorID = req.body.registradoPorID;

    const query = `insert into comentario ( compraID, descripcion, fecha_reg, 
        registradoPorID ) VALUES (
         "${p_compraID}", "${p_descripcion}", now(), "${p_registradoPorID}" )  `;

    const reg = await registrar_comentario(req, res, query);
    const comentario_regID = reg.insertId;

    if ( comentario_regID == '' ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear el comentario'
        })
    }
    else{
        return res.status(201).json({
            ok: true,
            mensaje: 'Comentario registrado'
        })
    }
}

function registrar_comentario(req, res, query) {
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                consql.rollback(()=>{
                    return reject(err);
                });
            }
            resolve(rows);
        });
    });
}


// ==========================================
// borrar un comentario de orden de compra
// ==========================================
const borrarComentario = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar_existe_comentario(req, res, reg);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error comentario no encontrado'
        })
    }

    const p_uno_eliminar_cuerpo = await eliminar(req, res, reg);

    if ( p_uno_eliminar_cuerpo.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al eliminar comentario'
        });
    }
    else{
        return res.status(200).json({
            ok: true,
            mensaje: "Comentario eliminado"
        });
    }
}

function consultar_existe_comentario(req, res, id) {
    const query = `
    select count(comentarioID) as cantidad from comentario
    where comentarioID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['cantidad']);
        });
    });
}

function eliminar(req, res, reg) {
    const p_id = reg;

    // eliminar
    const query_eliminar = `
    delete FROM comentario
    where comentarioID = "${ p_id }"
    `;

    return new Promise((resolve, reject) => {
        consql.query(query_eliminar, (err, rows, fields) => {
            if (err) {
                console.log("Error: " + err.message);
                throw err;
            }
            resolve(rows);
        });
    });
}

module.exports = {
    getComentarios,
    getComentariosByID,
    crearComentario,
    borrarComentario
}