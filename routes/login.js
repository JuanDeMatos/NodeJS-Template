var express = require('express');
var router = express.Router();
const perm = require('../permissions');
const hash = require('pbkdf2-password')();
const dbFunciones = require('./db').dbFactory('sqlite')

router.get('/', function (req, res, next) {
    if (req.session.usuario) {
        console.log('Sesión iniciada')
        res.redirect('/inicio')
    }
    res.render('login', {
        login_error: "none"
    });
});

router.post('/', function (req, res, next) {
    const usuario = req.body['usuario']
    const password = req.body['password']

    // Variables en las que se va almacenar el hash y el salt


    // Se genera el hash y el salt y se guardan


    if (req.session.usuario) {
        res.redirect('/control')
    } else {
        funcion = function funIniciar(rows) {
            if (rows.length == 0)
                res.render('login', {
                    login_error: "inline"
                });
            else {

                hash({
                    password: password
                }, function (err, pass, salt, hash) {
                    if (err) throw err;
                    
                    verificar(rows[0])
                        
                });

            }
        }

        function verificar(row) {
            // Se verifica la password_correcta
            hash({
                password: password,
                salt: row.salt
            }, function (err, pass,
                salt, hash) {
                if (err) throw err;

                if (row.hash === hash) {
                    switch (row.permission) {
                        case perm.ADMIN:
                            req.session.usuario = usuario
                            req.session.permission = perm.ADMIN
                            res.redirect('/control')
                            break;
                        case perm.USER:
                            req.session.usuario = usuario
                            req.session.permission = perm.USER
                            res.redirect('/control')
                            break;
                        case perm.NONE:

                            break;
                        default:
                            break;
                    }
                }
                else {
                    res.render('login', {
                        login_error: "inline"
                    });
                }
            });
        }

        dbFunciones.iniciarSesion(funcion, usuario)

    }

});

module.exports = router;