var express = require('express');
var router = express.Router();
const db = require('../db/database');
const crypto = require('node:crypto');

const sql = `SELECT username, password, nome, cognome, email, dataNascita, sesso, ruolo FROM utenti WHERE username = ? OR email = ?`;

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

router.post('/', async function(req, res) {
    const { email_username, password } = req.body;
    try
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(email_username, email_username);
        if (!row) {
            return res.render('login', {
                title: 'Login',
                error: 'Credenziali non valide'
            });
        }
        const ok = await verifyPassword(password, row.password);
        if (!ok) {
            return res.render('login', {
                title: 'Login',
                error: 'Credenziali non valide'
            });
        }
        // sessione utente
        req.session.user = {
            username: row.username,
            nome: row.nome,
            cognome: row.cognome,
            email: row.email,
            dataNascita: row.dataNascita,
            sesso: row.sesso,
            apiKey: row.api_key,
            ruolo: row.ruolo
        };
        return res.redirect('/account');
    }
    catch (error)
    {
        console.error("Errore login:", error);
        return res.render('login', {
            title: 'Login',
            error: 'Errore durante la verifica'
        });
    }
});

/* POST logs out the user */
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;