//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');
const path = require('path');
const { subirArchivo } = require('../helpers/subir-archivo');
const fs = require('fs');
const pdf = require('html-pdf');

//var html = fs.readFileSync('./tpl/tpl-1.html', 'utf8');


// Constantes propias del programa
//const contenidoHtml = fs.readFileSync('./tpl/tpl-1.html', 'utf8');
const ubicacionPlantilla = require.resolve("../plantilla/nuevo.html");
let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');
const config = {
    "format" : "A4"
}

const formateador = new Intl.NumberFormat("en", { style: "currency", "currency": "MXN" });

// Constantes propias del programa

// =======================================================
// Generar reporte pdf a una orden de compra
// =======================================================
const getReporteByID = async (req, res) => {

    const id = req.params.id;

    const obtenerReg = await consultar_existe_compra(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error orden de compra no encontrada'
        })
    }

    const reg_cabecera = await consultar_cabecera(req, res, id);
    const reg_detalle = await consultar_detalle_productos(req, res, id);

     let tabla = "";
    //let subtotal = 0;
    let contador = 0;
    for (const producto of reg_detalle) {
        contador ++;
        tabla += `<tr>
            <th>${ contador }</th>
            <td>${ producto.sku }</td>
            <td>${ producto.codigo_de_fabrica }</td>
            <td>${ producto.marca }</td>
            <td>${ producto.nombre_item }</td>
            <td> unidad </td>
            <td>${ producto.cantidad }</td>
            <td>${ producto.precio_bs_referencial }</td>
            <td>${ producto.monto }</td>
        </tr>`;
    }

    // let tabla = "";
    // let subtotal = 0;
    // for (const producto of productos) {
    //     // Aumentar el total
    //     const totalProducto = producto.cantidad * producto.precio;
    //     subtotal += totalProducto;
    //     // Y concatenar los productos
    //     tabla += `<tr>
    // <td>${producto.descripcion}</td>
    // <td>${producto.cantidad}</td>
    // <td>${formateador.format(producto.precio)}</td>
    // <td>${formateador.format(totalProducto)}</td>
    // </tr>`;
    // }
    //const descuento = 0;
    //const subtotalConDescuento = subtotal - descuento;
    //const impuestos = subtotalConDescuento * 0.16
    //const total = subtotalConDescuento + impuestos;
    // Remplazar el valor {{tablaProductos}} por el verdadero valor
    contenidoHtml = contenidoHtml.replace( "{{tablaProductos}}", tabla );

    // Y también los otros valores
    // contenidoHtml = contenidoHtml.replace("{{subtotal}}", formateador.format(subtotal));
    // contenidoHtml = contenidoHtml.replace("{{descuento}}", formateador.format(descuento));
    // contenidoHtml = contenidoHtml.replace("{{subtotalConDescuento}}", formateador.format(subtotalConDescuento));
    // contenidoHtml = contenidoHtml.replace("{{impuestos}}", formateador.format(impuestos));
    // contenidoHtml = contenidoHtml.replace("{{total}}", formateador.format(total));
    contenidoHtml = contenidoHtml.replace( "{{codigo}}", reg_cabecera[0]['codigo'] );

    contenidoHtml = contenidoHtml.replace( "{{proveedor}}", reg_cabecera[0]['marca_alias'] );
    contenidoHtml = contenidoHtml.replace( "{{nombre_area}}", reg_cabecera[0]['nombre_area'] );
    contenidoHtml = contenidoHtml.replace( "{{fecha_registro_compra}}", reg_cabecera[0]['fecha_registro_compra'] );
    contenidoHtml = contenidoHtml.replace( "{{nit}}", reg_cabecera[0]['nit'] );
    contenidoHtml = contenidoHtml.replace( "{{forma_pago}}", reg_cabecera[0]['forma_pago'] );
    contenidoHtml = contenidoHtml.replace( "{{descripcion}}", reg_cabecera[0]['descripcion'] );
    contenidoHtml = contenidoHtml.replace( "{{moneda}}", reg_cabecera[0]['moneda'] );
    contenidoHtml = contenidoHtml.replace( "{{ticket}}", reg_cabecera[0]['ticket'] );
    contenidoHtml = contenidoHtml.replace( "{{tiempo_entrega}}", reg_cabecera[0]['tiempo_entrega'] );

    contenidoHtml = contenidoHtml.replace( "{{sub_total}}", reg_cabecera[0]['sub_total'] );
    contenidoHtml = contenidoHtml.replace( "{{descuento}}", reg_cabecera[0]['descuento'] );
    contenidoHtml = contenidoHtml.replace( "{{total_compra}}", reg_cabecera[0]['total_compra'] );
    pdf.create(contenidoHtml, config).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });

}

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

function consultar_cabecera(req, res, id) {
    const query = `select
    c.compraID, prov.marca_alias, area.nombre_area, 
    date_format(c.fecha_reg, "%d-%m-%Y") as fecha_registro_compra, c.nit, fp.descripcion as forma_pago, 
    c.descripcion, mo.nombre_moneda as moneda, c.ticket, te.descripcion as tiempo_entrega, c.codigo,
    c.sub_total, c.descuento, c.total_compra
    from compra c
    inner join proveedor prov
    on prov.proveedorID = c.proveedorID
    inner join area
    on area.IDarea = c.area_solicitanteID
    inner join forma_pago fp
    on fp.forma_pagoID = c.forma_pago
    inner join moneda mo
    on mo.monedaID = c.monedaID
    inner join tiempo_entrega te
    on te.tiempo_entrega_ID = c.tiempo_entrega
    where c.compraID = "${id}"  `;

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

function consultar_detalle_productos(req, res, id) {
    const query = `select 
    item.itemID, 'sku', item.codigo_de_fabrica, item.marca, item.nombre_item, de.cantidad, item.precio_bs_referencial, de.monto
        from
            compra_detalle de
        inner join item
        on item.itemID = de.itemID
    where de.compraID = "${id}"  `;

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
    getReporteByID
}