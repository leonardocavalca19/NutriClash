var express = require('express');
var router = express.Router();
const db = require('../db/database');
const crypto = require('crypto');

const sql = `DELETE FROM utenti WHERE username = ? OR email = ?`;
const sqlApiKey = `UPDATE utenti SET apiKey = ? WHERE username = ? OR email = ?`;

function requireLogin(req, res, next) {

    if (!req.session.user) {
        return res.redirect('/login');
    }

    next();
}

router.get('/', requireLogin, function(req, res) {
    const user = {
        nome: req.session.user.nome,
        cognome: req.session.user.cognome,
        username: req.session.user.username,
        email: req.session.user.email,
        data_nascita: req.session.user.dataNascita,
        sesso: req.session.user.sesso,
        apiKey: req.session.user.apiKey,
        ruolo: req.session.user.ruolo
    };

    console.log(`Accesso alla pagina account di ${user.apiKey}`);

    res.render('account', {
        title: 'Account',
        user
    });
});

router.post('/delete', requireLogin, (req, res) => {

    try {

        const stmt = db.prepare(sql);
        const result = stmt.run(
            req.session.user.username,
            req.session.user.email
        );

        // opzionale: controlla se ha eliminato qualcosa
        if (result.changes === 0) {
            return res.render('account', {
                title: 'Account',
                user: req.session.user,
                error: 'Utente non trovato'
            });
        }

        req.session.destroy(() => {
            res.redirect("/");
        });

    } catch (err) {

        console.error('Errore eliminazione account:', err.message);

        return res.render('account', {
            title: 'Account',
            user: req.session.user,
            error: 'Errore interno'
        });
    }
});


router.post('/request-api-key', requireLogin, (req, res) => {
    
    try {
        const newApiKey = crypto.randomBytes(32).toString('hex');      //Genera una stringa casuale di 32 byte in formato esadecimale
        
        const stmt1 = db.prepare(sqlApiKey);
        stmt1.run(newApiKey, req.session.user.username, req.session.user.email);

        req.session.user.apiKey = newApiKey;

        console.log(`Nuova API Key generata per ${req.session.user.username}: ${newApiKey}`);

        return res.render('account', {
            title: 'Account',
            user: req.session.user,
            success: 'Chiave API generata con successo!',
            apiKey: newApiKey
        });

    } catch (err) {
        console.error("Errore generazione API Key:", err);
        return res.render('account', {
            title: 'Account',
            user: req.session.user,
            error: 'Errore interno durante la generazione della chiave'
        });
    }
});

module.exports = router;