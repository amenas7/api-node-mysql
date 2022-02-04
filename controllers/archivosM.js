//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');
const path = require('path');
const { subirArchivo } = require('../helpers/subir-archivo');
var fs = require('fs');

  //const cargaArchivo = async (req, res) => {

// const cargaArchivo = async (req, res) => {
 
//     if ( !req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
//       res.status(400).json( {mensaje:'No hay archivos que subir'} );
//       return;
//     }

//     try {

//         // solo pdf
//         const pathCompleto = await subirArchivo( req.files, ['pdf'], 'documentos' );

//         res.json({
//             nombre: pathCompleto
//         })
        
//     } catch (error) {
//         res.status(400).json({
//             error
//         })
//     }

// }

const SubirMultir = async (req, res) => {
    const id = req.body.compraID;
    const registradoPorID = req.body.registradoPorID;
        //return console.log(req);
        //const file = req.file.filename;
        //console.log(file)
        
        //  try {
        //     res.send(
        //         { data: "OK", 
        //         //url: `http://localhost:8080/${file}` 
        //      });
        //  } catch (error) {
        //      console.log(error);
        //  }
    try {

        // solo pdf
        //const nombre_documento = await subirArchivo( req.files, ['pdf'], 'documentos' );

        let arreglo = {
            idc: id,
            registradoPorID,
            nombre_documento : req.file.filename,
            nombreOriginal: req.file.filename
        }

        //return console.log(arreglo);

        const reg = await registrar_documento_a_la_compra(req, res, arreglo);

        if ( reg.insertId < 1 ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al subir documento'
            })
        }
        else{
            return res.status(200).json({
                ok: true,
                mensaje: 'Documento subido correctamente'
            })
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error
        })
    }
     
}

// =======================================================
// obtener todos los archivos segun una orden de compra
// =======================================================
const getArchivosByID = async (req, res) => {
    const id = req.params.id;
    
    const obtenerReg = await consultar_existe_documento(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error archivo no encontrado'
        })
    }

    const listado = await consultar_archivos(req, res, id);

    return res.status(200).json({
        ok: true,
        data : listado
    });
}

function consultar_archivos(req, res, id) {
    const query = `select 
    archivoID, compraID, nombre_archivo_original, nombre_archivo_server, 
    date_format(fecha_reg, "%d-%m-%Y") fecha_reg, registradoPorID
    from archivo
    where compraID = "${id}"  `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// ==========================================
// regisutrar un documento
// ==========================================
const cargaArchivo = async (req, res) => {

    const id = req.body.compraID;
    const registradoPorID = req.body.registradoPorID;


    //return console.log(req);
 
    if ( !req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
      res.status(400).json( {mensaje:'No hay archivos que subir'} );
      return;
    }

    try {

        // solo pdf
        const nombre_documento = await subirArchivo( req.files, ['pdf'], 'documentos' );

        let arreglo = {
            idc: id,
            registradoPorID,
            nombre_documento : nombre_documento['nombreTemp'],
            nombreOriginal: nombre_documento['nombreOriginal']
        }

        const reg = await registrar_documento_a_la_compra(req, res, arreglo);

        if ( reg.insertId < 1 ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al subir documento'
            })
        }
        else{
            return res.status(200).json({
                ok: true,
                mensaje: 'Documento subido correctamente'
            })
        }
        
    } catch (error) {
        res.status(400).json({
            error
        })
    }

}

function registrar_documento_a_la_compra(req, res, arreglo) {

    const p_idc = arreglo.idc;
    const p_nombreOriginal = arreglo.nombreOriginal;
    const p_nombre_documento = arreglo.nombre_documento;
    const p_registradoPorID = arreglo.registradoPorID;

    //return console.log(p_nombreOriginal);

    const query = `
    insert into archivo ( compraID, nombre_archivo_original, nombre_archivo_server, fecha_reg, registradoPorID ) values 
    ( "${p_idc}", "${p_nombreOriginal}", "${p_nombre_documento}", now(), "${p_registradoPorID}" ) `;

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
// borrar un documento
// ==========================================
const borrarArchivo = async (req, res) => {

    const id = req.params.id;

    const obtenerReg = await consultar_existe_documento_archivo(req, res, id);

    if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error archivo no encontrado'
        })
    }

    // si existe, elimina la imagen fisica
    const obtenerReg_fisico = await consultar_existe_documento_fisico(req, res, id);
    const pathImagen = path.join(__dirname , '../archivos/documentos/', obtenerReg_fisico );

    if ( fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);
    }
 
    const reg = await eliminar_documento_a_la_compra(req, res, id);

    if ( reg.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al eliminar documento'
        })
    }
    else{
        return res.status(200).json({
            ok: true,
            mensaje: 'Documento eliminado correctamente'
        })
    }
        


}

function consultar_existe_documento(req, res, id) {
    const query = `
    select count(compraID) as cantidad from archivo
    where compraID = "${id}" `;

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

function eliminar_documento_a_la_compra(req, res, id) {
    const query = `
    delete from archivo
    where archivoID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

module.exports = {
    SubirMultir,
    cargaArchivo
}