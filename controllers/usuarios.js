const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los usuarios
// ==========================================
const getUsuarios = (req, res) => {
    consql.query(` SELECT persona.IDpersona, 
    usuario.usuarioID as uid, persona.numdoc , persona.nombrecompleto as nombre_completo,
    usuario.usuario, usuario.IDarea, area.nombre_area as area_nombre, usuario.IDrol, rol.descripcion as rol_nombre ,usuario.estado,
		persona.email as correo
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    WHERE usuario.estado = 1 ORDER BY usuario.usuarioID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
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
// obtener un usuario por el ID
// ==========================================
const getUsuarioByID = (req, res) => {
    const id = req.params.id;

    consql.query(` SELECT persona.IDpersona, 
    usuario.usuarioID as uid, persona.numdoc , persona.nombrecompleto as nombre_completo,
    usuario.usuario, usuario.IDarea, area.nombre_area as area_nombre, usuario.IDrol, rol.descripcion as rol_nombre ,usuario.estado,
		persona.email as correo
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    where usuario.usuarioID = "${id}" AND usuario.estado = 1 `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un usuario con el parametro buscado'
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
                mensaje: 'Error cargando usuario',
                error: err
            })
        }

    });
}

// ==========================================
// crear un nuevo usuario
// ==========================================
const crearUsuario = async(req, res) => {

    const p_dni = req.body.dni;
    const p_nombres = req.body.nombres;
    const p_apaterno = req.body.apaterno;
    const p_amaterno = req.body.amaterno;
    const p_usuario = req.body.usuario;
    const p_role = req.body.role;
    const p_area = req.body.area;
    const p_correo = req.body.correo;

    // escriptar password
    const salt = bcrypt.genSaltSync();
    const p_password = bcrypt.hashSync( req.body.password, salt );

    const query = `CALL USP_REG_USUARIO( "${p_dni}", "${p_apaterno}", "${p_amaterno}", 
    "${p_nombres}", "${p_usuario}", "${p_password}" , "${p_role}", "${p_area}", "${p_correo}" )  `;

    const reg = await registrar(req, res, query);
 
    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario'
        })
    }

    const consulta = await consultar(req, res, reg);

    let arreglo = {
        uid: consulta[0].usuarioID,
        nombre_completo: consulta[0].nombre_total,
        usuario: consulta[0].usuario,
        password: consulta[0].password,
        rol_nombre: consulta[0].nombre_rol
    }

    // crear token
    //const token =  await generarJWT( consulta[0].usuarioID );
    
    res.status(201).json({
        ok: true,
        data: arreglo,
        mensaje: "Usuario creado correctamente"
        //token
    });

}

function registrar(req, res, query) {
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0][0].idp);
        });
    });
}

function consultar(req, res, reg) {
    const query = `
    SELECT 
    usuario.usuarioID, persona.numdoc ,concat( persona.apepat, ' ', persona.apemat, ', ', persona.nombres ) as nombre_total, 
    persona.apepat as apaterno, persona.apemat as amaterno, persona.nombres as solo_nombre, 
    usuario.usuario, usuario.IDarea, area.nombre_area, usuario.IDrol, rol.descripcion as nombre_rol ,usuario.estado
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    where usuario.usuarioID = "${reg}" AND usuario.estado = 1  
    `;

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
// actualizar un usuario
// ==========================================
 const actualizarUsuario = async(req, res = response) => {
    const reg = req.params.id;

    const p_idp = req.body.id_persona;
    const p_dni = req.body.dni;
    const p_nombres = req.body.nombres;
    const p_apaterno = req.body.apaterno;
    const p_amaterno = req.body.amaterno;
    const p_usuario = req.body.usuario;
    const p_role = req.body.role;
    const p_area = req.body.area;
    const p_correo = req.body.correo;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }
    let arreglo = {
        idu: reg,
        idp: p_idp,
        dni: p_dni,
        nombres: p_nombres,
        apaterno: p_apaterno,
        amaterno: p_amaterno,
        usuario: p_usuario,
        role: p_role,
        area: p_area,
        correo: p_correo
    }
    const actualizareg = await actualizar(req, res, arreglo);
    // insertId
    if (actualizareg.affectedRows == '0') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario'
        });
    }

    const consultar_nuevo = await consultar(req, res, reg);

    let arreglonuevo = {
        id: consultar_nuevo[0].usuarioID,
        nombre: consultar_nuevo[0].nombre_total,
        usuario: consultar_nuevo[0].usuario,
        role: consultar_nuevo[0].role,
        area: consultar_nuevo[0].area
    }
    res.status(200).json({
        ok: true,
        data: arreglonuevo,
        mensaje: "Usuario modificado"
    });

    

 };

 function actualizar(req, res, arreglo) {
    const p_id = arreglo.idu;
    const p_idp = arreglo.idp;
    const p_dni = arreglo.dni;
    const p_nombres = arreglo.nombres;
    const p_apaterno = arreglo.apaterno;
    const p_amaterno = arreglo.amaterno;
    const p_usuario = arreglo.usuario;
    const p_role = arreglo.role;
    const p_area = arreglo.area;
    const p_correo = arreglo.correo;

    const query = `
    UPDATE persona
    SET numdoc = "${p_dni}",
    nombres = "${p_nombres}",
    apepat = "${p_apaterno}",
    apemat = "${p_amaterno}",
    email = "${p_correo}"
    WHERE IDpersona = "${p_idp}"
    `;

    //console.log(query);

    const query2 = `
    UPDATE usuario
    SET usuario = "${p_usuario}",
    IDrol = "${p_role}",
    IDarea = "${p_area}" 
    WHERE usuarioID = "${p_id}"
    `;

    consql.query(query2, (err, rows, fields) => {
        if (err) {
            console.log("Error: " + err.message);
            throw err;
        }
    });

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            //console.log(query);
            resolve(rows);
        });
    });


    
}


// ==========================================
// borrar un usuario
// ==========================================
const borrarUsuario = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }

    const actualizareg = await eliminar(req, res, reg);
    if (actualizareg.insertId != '0') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario'
        });
    }
    else{
        res.status(200).json({
            ok: true,
            mensaje: "Usuario eliminado"
        });
    }
}

function eliminar(req, res, reg) {
    const p_id = reg;

    const query = `
    UPDATE usuario
    SET estado = 0
    WHERE usuarioID = "${p_id}"
    `;
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
/*---------------------------------------------------*/
/*--------------------ROLES--------------------------*/
// ==========================================
// obtener todos los roles activos
// ==========================================
const getUsuarios_roles = (req, res) => {
    consql.query( `SELECT IDrol, descripcion, estado FROM rol where estado = 1`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando roles',
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
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
    getUsuarioByID
}