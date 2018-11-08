const express = require('express');
const Producto = require('../models/producto');
const _ = require('underscore');


const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

//============================
//Obtener Todos Los Productos
//============================

app.get('/productos', verificaToken, (req, res) => {
    //todos los productos
    //populate: usuario categoria
    //paginado

    let desde = req.query.desde || 0
    let limite = req.query.limite || 5;

    desde = Number(desde);
    limite = Number(limite);
    Producto.find({})
        .skip(desde)
        .limit(limite)
        .populate('usuario, categoria')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'No se encontraron productos'
                })
            }

            res.json({
                ok: true,
                productoDB
            })
        })
})

//============================
//Obtener un producto por ID
//============================

app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario categoria
    //paginado
    let idBusqueda = req.params.id;
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    console.log(idBusqueda);

    desde = Number(desde);
    limite = Number(limite);
    Producto.findById(idBusqueda)
        .skip(desde)
        .limit(limite)
        .populate('usuario, categoria')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'No se encontraron productos con esté ID'
                })
            }
            if (!productoDB.disponible) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'producto no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        })

})

//============================
//Buscar un producto 
//============================


app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario, categoria')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })

});
//============================
//Crear un nuevo producto
//============================

app.post('/productos', verificaToken, (req, res) => {
    //Grabar el usuario
    //Grabar Categoria del listado
    let body = req.body;
    let producto = new Producto({
        nombre: body.descripcion,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.IdCategoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se pudo agregar el Producto a la BD'
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

//============================
//Actualiza un producto
//============================

app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria', 'disponible']);
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });

        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'no se encontro producto para actualizar'
            });
        }


        res.json({
            ok: true,
            producto: productoDB
        });


    })
})


//============================
//Borra un producto
//============================

app.delete('/productos/:id', verificaToken, (req, res) => {
    //disponible=falso
    let id = req.params.id;
    let cambiaEstado = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });

        }
        if (!productoBorrado.estado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado
        })
    })
})

module.exports = app;