const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();



app.get('/usuario', function(req, res) {
    let desde = req.query.desde || 0
    let limite = req.query.limite || 5;

    //

    desde = Number(desde);
    limite = Number(limite);
    Usuario.find({ estado: true }, 'nombre email role estado google  img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });

            }
            Usuario.count({ estado: true }, (err, count) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: count
                })
            })

        })
})

app.post('/usuario', function(req, res) {



    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });

})

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'estado']);

    delete body.password;
    delete body.google;
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });

        }


        res.json({
            ok: true,
            usuario: usuarioDB
        });


    })

})

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    //Usuario.findByIdAndRemove(id, (err, UsuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, UsuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });

        }
        if (!UsuarioBorrado.estado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: UsuarioBorrado
        })
    })
})

module.exports = app;