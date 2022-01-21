const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las ordenes de compra
// ==========================================
const getOComprasTodas = (req, res) => {
    consql.query(` select 
    c.compraID, c.fecha_reg, c.estado, area.nombre_area, c.descripcion, c.reg_fisico
    from
    compra c
    inner join compra_detalle de
    on c.compraID = de.compraID
    inner join proveedor prov
    on prov.proveedorID = c.proveedorID
    inner join item
    on item.itemID = de.itemID
    inner join area
    on area.IDarea = c.area_solicitanteID
    where c.reg_fisico = '1'
    GROUP BY c.compraID
    ORDER BY c.compraID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ordenes de compra',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                compra_detalle: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// obtener una orden de compra por el ID
// ==========================================
const getOCompraByID = (req, res) => {
    const id = req.params.id;

    consql.query(` select 
    c.compraID, item.itemID, item.codigo_de_fabrica, 
    item.marca, item.nombre_item,
    de.cantidad, item.precio_bs_referencial, de.monto
    
    from compra_detalle de
    inner join compra c 
    on de.compraID = c.compraID
    inner join proveedor prov
    on prov.proveedorID = c.proveedorID
    inner join item
    on item.itemID = de.itemID
    where c.compraID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe una orden de compra con el parametro buscado'
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
                mensaje: 'Error cargando ordenes de compra',
                error: err
            })
        }

    });
}


// ==========================================
// crear una orden de compra
// ==========================================
const crearOCompra = async(req, res) => {

    const p_proveedorID = req.body.proveedorID;
    const p_area_solicitanteID = req.body.area_solicitanteID;
    const p_clienteID = req.body.clienteID;
    const p_nit = req.body.nit;
    const p_forma_pago = req.body.forma_pago;
    const p_descripcion = req.body.descripcion;
    const p_monedaID = req.body.monedaID;
    const p_ticket = req.body.ticket;
    const p_tiempo_entrega = req.body.tiempo_entrega;


    const p_sub_total = req.body.sub_total;
    const p_descuento = req.body.descuento;
    const p_total_compra = req.body.total_compra;

    const p_arreglo = req.body.productos;

    const query = `insert into compra ( proveedorID, area_solicitanteID, clienteID, 
        fecha_reg, nit, forma_pago, descripcion, monedaID, ticket, tiempo_entrega,
        sub_total, descuento, total_compra, estado, estado_autorizado, reg_fisico ) VALUES (
         "${p_proveedorID}", "${p_area_solicitanteID}", "${p_clienteID}", now(), "${p_nit}", 
         "${p_forma_pago}", "${p_descripcion}", "${p_monedaID}", "${p_ticket}", "${p_tiempo_entrega}", 
         "${p_sub_total}", "${p_descuento}", "${p_total_compra}", "Creado", "Pendiente", "1" )  `;

    const reg = await registrar_compra(req, res, query);
    const compra_regID = reg.insertId;

    if ( reg.insertId == '' ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear orden de compra'
        })
    }
    else{
        const regdetalle = await registrar_compra_detalle(p_arreglo, res, compra_regID);
        if ( regdetalle.insertId == '' ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear detalle de orden de compra'
            })
        }else{
            return res.status(201).json({
                ok: true,
                mensaje: 'Orden de compra registrada'
            })
        }

    }

}

function registrar_compra(req, res, query) {
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

function registrar_compra_detalle(p_arreglo, res, compra_regID) {
    return new Promise((resolve, reject) => {
        p_arreglo.forEach(element => {
            consql.query(` insert into compra_detalle ( compraID, itemID, cantidad, monto ) VALUES (
                "${compra_regID}" , "${element.itemID}", "${element.cantidad}", "${element.monto}" );
            `, ( err, rows, fields ) =>{
                if (err) {
                    consql.rollback(()=>{
                        return reject(err);
                    });
                }
                resolve(rows);
            });
        });
    });
}


// ==========================================
// modificar una orden de compra
// ==========================================
const actualizarOcompra = async(req, res = response) => {
    const id = req.params.id;

    const p_proveedorID = req.body.proveedorID;
    const p_area_solicitanteID = req.body.area_solicitanteID;
    const p_clienteID = req.body.clienteID;
    const p_nit = req.body.nit;
    const p_forma_pago = req.body.forma_pago;
    const p_descripcion = req.body.descripcion;
    const p_monedaID = req.body.monedaID;
    const p_ticket = req.body.ticket;
    const p_tiempo_entrega = req.body.tiempo_entrega;

    const p_sub_total = req.body.sub_total;
    const p_descuento = req.body.descuento;
    const p_total_compra = req.body.total_compra;

    const p_arreglo = req.body.productos;

    const obtenerReg = await consultar_existe_compra(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error orden de compra no encontrada'
        })
    }
    let arreglo = {
        idc: id,
        proveedorID: p_proveedorID,
        area_solicitanteID: p_area_solicitanteID,
        clienteID: p_clienteID,
        nit: p_nit,
        forma_pago: p_forma_pago,
        descripcion: p_descripcion,
        monedaID: p_monedaID,
        ticket: p_ticket,
        tiempo_entrega: p_tiempo_entrega,
        sub_total: p_sub_total,
        descuento: p_descuento,
        total_compra: p_total_compra,
        detalle: p_arreglo

    }
    const p_uno_eliminar_detalle = await uno_eliminar_detalle(req, res, arreglo);

    if ( p_uno_eliminar_detalle.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar orden de compra'
        });
    }

    const p_dos_actualizar_compra = await dos_actualizar_compra(req, res, arreglo);

    if ( p_dos_actualizar_compra.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se modificó los datos de la orden de compra cuerpo'
        });
    }

    const p_tres_actualizar_compra_detalle = await tres_actualizar_compra_detalle(arreglo, res, id);

    if ( p_tres_actualizar_compra_detalle.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se modificó los datos de la orden de compra detalle'
        });
    }

    return res.status(200).json({
        ok: true,
        mensaje: "Orden de compra modificada"
    });

 };

 function consultar_existe_compra(req, res, id) {
    const query = `
    select count(compraID) as cantidad from compra
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

function uno_eliminar_detalle(req, res, arreglo) {
    const p_idc = arreglo.idc;

    // eliminar los detalles de compra
    const query_eliminar = `
    delete FROM compra_detalle
    where compraID = "${ p_idc }"
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

function dos_actualizar_compra(req, res, arreglo) {
    const p_idc = arreglo.idc;

    const p_proveedorID = arreglo.proveedorID;
    const p_area_solicitanteID = arreglo.area_solicitanteID;
    const p_clienteID = arreglo.clienteID;
    const p_nit = arreglo.nit;
    const p_forma_pago = arreglo.forma_pago;
    const p_descripcion = arreglo.descripcion;
    const p_monedaID = arreglo.monedaID;
    const p_ticket = arreglo.ticket;
    const p_sub_total = arreglo.sub_total;
    const p_tiempo_entrega = arreglo.tiempo_entrega;
    const p_descuento = arreglo.descuento;
    const p_total_compra = arreglo.total_compra;

    // modificar el cuerpo principal de la orden de compra
    const query = `
    UPDATE compra
    SET proveedorID = "${p_proveedorID}",
    area_solicitanteID = "${p_area_solicitanteID}",
    clienteID = "${p_clienteID}",
    fecha_mod = now(),
    nit = "${p_nit}",
    forma_pago = "${p_forma_pago}",
    descripcion = "${p_descripcion}",
    monedaID = "${p_monedaID}",
    ticket = "${p_ticket}",
    tiempo_entrega = "${p_tiempo_entrega}",
    sub_total = "${p_sub_total}",
    descuento = "${p_descuento}",
    total_compra = "${p_total_compra}"
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

function tres_actualizar_compra_detalle(arreglo, res, compraID) {

    // arreglo de productos en la compra
    const p_detalle = arreglo.detalle;

    return new Promise((resolve, reject) => {
        p_detalle.forEach(element => {
            consql.query(` insert into compra_detalle ( compraID, itemID, cantidad, monto ) VALUES (
                "${compraID}" , "${element.itemID}", "${element.cantidad}", "${element.monto}" );
            `, ( err, rows, fields ) =>{
                if (err) {
                    consql.rollback(()=>{
                        return reject(err);
                    });
                }
                resolve(rows);
            });
        });
    });
}

// ==========================================
// borrar una orden de compra
// ==========================================
const borrarOcompra = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar_existe_compra(req, res, reg);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error orden de compra no encontrada'
        })
    }

    let arreglo = {
        idc: reg
    }
    const p_uno_eliminar_detalle = await uno_eliminar_detalle(req, res, arreglo);

    if ( p_uno_eliminar_detalle.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al eliminar orden de compra'
        });
    }

    const p_uno_eliminar_cuerpo = await eliminar(req, res, reg);

    if ( p_uno_eliminar_cuerpo.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al eliminar orden de compra'
        });
    }
    else{
        return res.status(200).json({
            ok: true,
            mensaje: "Orden de compra eliminada"
        });
    }
}

function eliminar(req, res, reg) {
    const p_id = reg;

    // eliminar
    const query_eliminar = `
    delete FROM compra
    where compraID = "${ p_id }"
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
    getOComprasTodas,
    getOCompraByID,
    crearOCompra,
    actualizarOcompra,
    borrarOcompra
}