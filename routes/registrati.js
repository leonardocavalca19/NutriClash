var express = require('express');
var router = express.Router();
const db = require('../db/database');
const crypto = require('node:crypto');

const sql = `INSERT INTO utenti (username, email, nome, cognome, dataNascita, sesso, password, ruolo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//funzione per hashare la password con scrypt e salt univoco
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

router.get('/', function(req, res, next) {
    res.render('registrati', { title: 'Registrazione' });
});

router.post('/', function(req, res) {
    console.log("Dati ricevuti:", req.body);
    const { username, nome, cognome, sesso, dataNascita, email, password } = req.body;
    try
    {
        const passwordHash = hashPassword(password);
        const stmt = db.prepare(sql);
        stmt.run(
            username,
            email,
            nome,
            cognome,
            dataNascita,
            sesso,
            passwordHash,
            "user" //ruolo
        );
        console.log("Utente registrato con successo");
        return res.redirect('/login');
    }
    catch (err)
    {
        let messaggioErrore = "Errore durante la registrazione."; 
        // gestione errori UNIQUE
        if (err.message && err.message.includes('UNIQUE')) {
            if (err.message.includes('username')) {
                messaggioErrore = "Lo username è già occupato.";
            } else if (err.message.includes('email')) {
                messaggioErrore = "L'email è già registrata.";
            }
        } else {
            console.log("Errore sconosciuto durante la registrazione:", err);
            console.error("Errore DB:", err.message);
        }
        return res.render('registrati', {
            title: 'Registrazione',
            error: messaggioErrore,
            dati: req.body
        });
    }
});
module.exports = router;