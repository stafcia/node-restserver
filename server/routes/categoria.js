const express = require('express');
const Categoria = require('../models/categoria');


const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();



//============================
//Mostrar todas las Categorias
//============================

app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre , email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });

            }
            Categoria.count((err, count) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: count
                })
            })

        })
});

//============================
//Mostrar una categoria por id
//============================

app.get('/categoria/:id', verificaToken, (req, res) => {

    let idBusqueda = req.params.id;
    Categoria.findById(idBusqueda, (err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categorias) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro categoria'
            });
        }
        res.json({
            ok: true,
            categorias: categorias
        });

    })
});

//============================
//Crea nueva categoria
//============================

app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});
//============================
//Actualiza categoria
//============================

app.put('/categoria/:id', verificaToken, (req, res) => {

    let idBusqueda = req.params.id;

    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    };
    Categoria.findByIdAndUpdate(idBusqueda, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });


    })
});

//============================
//Elimina
//============================

app.delete('/categoria/:id', verificaToken, verificaAdminRole, (req, res) => {
    let idBusqueda = req.params.id;

    Categoria.findByIdAndRemove(idBusqueda, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        })
    })
});

module.exports = app;