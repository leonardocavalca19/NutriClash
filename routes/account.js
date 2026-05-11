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


const memoriaAccessi = {};
const rateLimiterManuale = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000; 
    const MAX_RICHIESTE = 10;   

    console.log(`IP ${ip} ha fatto una richiesta. Conteggio attuale: ${memoriaAccessi[ip]?.conteggio || 0}`);

    if (!memoriaAccessi[ip]) {
        
        memoriaAccessi[ip] = { conteggio: 1, inizioFinestra: ORA_ATTUALE }; //Primo accesso dell'IP
    } else {

        if (ORA_ATTUALE - memoriaAccessi[ip].inizioFinestra > LIMITE_TEMPO) {           //Se è pssato più di un minuto, resetta il conteggio
            memoriaAccessi[ip].conteggio = 1;
            memoriaAccessi[ip].inizioFinestra = ORA_ATTUALE;
        } else {
            memoriaAccessi[ip].conteggio++;
        }
    }

    if (memoriaAccessi[ip].conteggio > MAX_RICHIESTE) {
        return res.render('account', {
            title: 'Account',
            user: req.session.user,
            apiKey: 'Troppe richieste. Riprova tra un minuto.'
        });
    }

    next();
};

router.get('/', requireLogin, function(req, res) {

    const user = {
        nome: req.session.user.nome,
        cognome: req.session.user.cognome,
        username: req.session.user.username,
        email: req.session.user.email,
        data_nascita: req.session.user.dataNascita,
        sesso: req.session.user.sesso,
        apiKey: req.session.user.apiKey
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



router.post('/request-api-key', rateLimiterManuale, requireLogin, (req, res) => {
    
    //TODO: aggiungere un controllo per evitare di generare una nuova chiave se l'utente ne ha già una valida a meno che non voglia esplicitamente rigenerarla
    

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