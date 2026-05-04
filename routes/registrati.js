var express = require('express');
var router = express.Router();
const db = require('../db/database');
const crypto = require('node:crypto');

const sql = `INSERT INTO utenti (username, email, nome, cognome, dataNascita, sesso, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;

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
    const { username, nome, cognome, sesso, dataNascita, email, password } = req.body;

    try {
        const passwordHash = hashPassword(password);

        db.run(sql, [username, email, nome, cognome, dataNascita, sesso, passwordHash], function(err) {
            if (!err) {
                console.log("Utente registrato con successo");      //se non ci sono errori, reindirizza alla pagina di login
                return res.redirect('/login');
            }

        
            let messaggioErrore = "Errore durante la registrazione.";           

            if (err.message && err.message.includes('UNIQUE constraint failed')) {      //se ci sono errori
                if (err.message.includes('username')) {
                    messaggioErrore = "Lo username è già occupato.";
                } else if (err.message.includes('email')) {
                    messaggioErrore = "L'email è già registrata.";
                }
            } else {
                console.error("Errore DB generico:", err.message);
            }

            
            return res.render('registrati', {           //restituisce la pagina di registrazione con un messaggio di errore e i dati inseriti
                title: 'Registrazione', 
                error: messaggioErrore,
                dati: req.body 
            });
        });

    } catch (err) {
        console.error("Errore hashing:", err);
        res.status(500).send("Errore interno del server.")
    }
});
module.exports = router;
