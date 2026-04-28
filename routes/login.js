var express = require('express');
var router = express.Router();
const db = require('../db/database');
const crypto = require('node:crypto'); 

const sql = `SELECT password FROM utenti WHERE username = ? OR email = ?`;

// Funzione per verificare la password inserita confrontandola con l'hash salvato nel DB
function verifyPassword(passwordInserita, stringaDalDB) {
    return new Promise((resolve, reject) => {
       
        const parti = stringaDalDB.split(':');   // Estraiamo salt e hash originale dalla stringa "salt:hash"
        if (parti.length !== 2) return resolve(false); // Formato DB non valido

        const [salt, hashOriginale] = parti;

        crypto.scrypt(passwordInserita, salt, 64, (err, derivedKey) => {  // Rigeneriamo l'hash usando lo stesso salt recuperato dal DB
            if (err) reject(err);

            
            const trovato = crypto.timingSafeEqual(     // Confronto sicuro contro timing attacks
                Buffer.from(hashOriginale, 'hex'),      
                derivedKey
            );
            resolve(trovato);
        });
    });
}

router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login' });
});

router.post('/', async function(req, res, next) {
    const { email_username, password } = req.body;

    db.get(sql, [email_username, email_username], async function(err, row) {
        if (err) {
            console.error('Errore durante il login:', err);
            return res.render('login', { title: 'Login', error: 'Errore interno' });
        }

        if (!row) {
            return res.render('login', { title: 'Login', error: 'Credenziali non valide' });
        }

        try {
            const trova = await verifyPassword(password, row.password);

            if (trova) {
                return res.redirect('/PIPPO');
            } else {
                return res.render('login', { title: 'Login', error: 'Credenziali non valide' });
            }
        } catch (error) {
            console.error("Errore hashing:", error);
            return res.render('login', { title: 'Login', error: 'Errore durante la verifica' });
        }
    });
});

module.exports = router;

  /*
  TODO: sostituire con la pagina di destinazione dopo il login, ad esempio /dashboard
  */

