const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');

const path = require('path');
var fs = require('fs');


// ==========================================
// descargar un archivo
// ==========================================
const getDescargarArchivo = async(req, res) => {

    const id = req.params.id;
    //{{url}}/api/usuarios_filtro/1?estado=2&activatekey=3
    //{{url}}/api/usuarios_filtro?estado=1&rol=1

    const obtenerReg = await consultar_existe_documento_archivo(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error archivo no encontrado'
        })
    }

    const obtenerReg_fisico = await consultar_existe_documento_fisico(req, res, id);
    //path.join(__dirname , '../archivos/documentos/', obtenerReg_fisico );

    return res.download( path.join(__dirname , '../archivos/documentos/', obtenerReg_fisico ), function(err){
        if (err) {
            console.log(err);
        }
        else{
            console.log("Listo :)");
        }
    });

}

function consultar_existe_documento_archivo(req, res, id) {
    const query = `
    select count(archivoID) as cantidad from archivo
    where archivoID = "${id}" `;

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

function consultar_existe_documento_fisico(req, res, id) {
    const query = `
    select nombre_archivo_server from archivo
    where archivoID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['nombre_archivo_server']);
        });
    });
}



module.exports = {
    getDescargarArchivo
}