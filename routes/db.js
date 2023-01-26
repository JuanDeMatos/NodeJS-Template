var express = require('express');
const sqlite3 = require('sqlite3')
const md5 = require('md5');
const encriptar = require('pbkdf2-password')()
const perm = require('../permissions');

function dbFactory(tipo) {
    let db
    switch (tipo) {
        case 'sqlite':
            db = sqliteDB()
            break;

        default:
            break;
    }
    return db;
}

function sqliteDB() {
    let db = {}

    db.conexion = new sqlite3.Database('./db/datos.db', sqlite3.OPEN_READWRITE |
        sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                resultado = err;
                console.log("Error: " + err);
                process.exit(1);
            }
        });

    db.createDatabase = function createDatabase() {
        let admin_salt, user_salt
        let admin_hash, user_hash

        const encriptar = require('pbkdf2-password')()

        encriptar({
            password: 'admin'
        }, function (err, pass, salt, hash) {
            if (err) throw err;
            admin_salt = salt;
            admin_hash = hash;

            encriptar({
                password: 'usuario'
            }, function (err, pass, salt, hash) {
                if (err) throw err;
                user_salt = salt;
                user_hash = hash;

                db.conexion.exec(
                    `
                create table if not exists usuarios (
                user text primary key not null,
                hash text not null,
                salt text not null,
                permission int not null
                );
                
                insert or replace into usuarios (user, hash, salt, permission)
                values ('admin', '${admin_hash}','${admin_salt}', 3);
                
                insert or replace into usuarios (user, hash, salt, permission)
                values ('usuario', '${user_hash}','${user_salt}', 2);
                
                `, (err) => {
                        if (err) {
                            console.log("Error: " + err);
                            process.exit(1);
                        }
                    });
            });

        });
    }

    db.iniciarSesion = function iniciarSesion(funIniciar, user) {

        db.conexion.all("select * from usuarios where user = ?", user, (err,
            rows) => {
            if (err) {
                console.log("Error: " + err);
                process.exit(1);
            }
            funIniciar(rows)
        });

    }

    db.borrarUsuario = function borrarUsuario(user) {
        db.conexion.run("delete from usuarios where user = ?", user, (err) => {
            if (err) {
                console.log("Error: " + err);
                process.exit(1);
            }
        });
    }

    db.findAllUsuarios = function findAllUsuario(funMostrar) {
        db.conexion.all("select * from usuarios", (err,
            rows) => {
            if (err) {
                console.log("Error: " + err);
                process.exit(1);
            }
            funMostrar(rows)
        });
    }

    db.cambiarPass = function cambiarPass(user, pass) {

        encriptar({
            password: pass
        }, function (err, pass, salt, hash) {
            if (err) throw err;

            db.conexion.run("update usuarios set hash = ?, salt = ? where user = ?", hash, salt, user, (err) => {
                if (err) {
                    console.log("Error: " + err);
                    process.exit(1);
                }
            });
        });
    }

    db.cambiarPermisos = function cambiarPermisos(user, perm) {


        db.conexion.run("update usuarios set permission = ? where user = ?", perm, user, (err) => {
            if (err) {
                console.log("Error: " + err);
                process.exit(1);
            }
        });

    }

    db.addUsuario = function addUsuario(user, pass) {

        db.conexion.all("select * from usuarios", (err,
            rows) => {
            if (err) {
                console.log("Error: " + err);
                process.exit(1);
            }
            let usuarios = new Array;

            rows.forEach(r => usuarios.push(r.user))

            if (!usuarios.includes(user)) {

                encriptar({
                    password: pass
                }, function (err, pass, salt, hash) {
                    if (err) throw err;

                    db.conexion.run("insert into usuarios values (?,?,?,?)", user, hash, salt, perm.USER, (err) => {
                        if (err) {
                            console.log("Error: " + err);
                            process.exit(1);
                        }
                    });
                });
            } else {
                console.log("El usuario ya existe");
            }
        });
    }

    return db;
}

exports.dbFactory = dbFactory;