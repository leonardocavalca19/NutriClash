import express from 'express';
const router = express.Router();
import { supabase } from "../db/supabase.js";
import crypto from 'crypto';

// Middleware per verificare che l'utente sia loggato
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Middleware antispam
const memoriaSpam = {};
const antispamTasto = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000;         
    const MAX_RICHIESTE = 15;           
    const DURATA_BAN = 15 * 60 * 1000;  

    if (memoriaSpam[ip] && memoriaSpam[ip].bannatoFinoA > ORA_ATTUALE) {
        const millisecondiMancanti = memoriaSpam[ip].bannatoFinoA - ORA_ATTUALE;
        const secondiTotali = Math.ceil(millisecondiMancanti / 1000);
        
        return res.status(403).render('ban', { secondiTotali });
    }

    if (!memoriaSpam[ip]) {
        memoriaSpam[ip] = { conteggio: 1, inizioFinestra: ORA_ATTUALE, bannatoFinoA: 0 };
    } else {
        if (ORA_ATTUALE - memoriaSpam[ip].inizioFinestra > LIMITE_TEMPO) {
            memoriaSpam[ip].conteggio = 1;
            memoriaSpam[ip].inizioFinestra = ORA_ATTUALE;
        } else {
            memoriaSpam[ip].conteggio++;
        }
    }

    if (memoriaSpam[ip].conteggio > MAX_RICHIESTE) {
        memoriaSpam[ip].bannatoFinoA = ORA_ATTUALE + DURATA_BAN;
        const secondiTotali = Math.ceil(DURATA_BAN / 1000);
        
        return res.status(403).render('ban', { secondiTotali });
    }

    next();
};

// Middleware per rate limit generale delle richieste 
const memoriaAccessi = {};
const rateLimiterManuale = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000; 
    const MAX_RICHIESTE = 10;   

    if (!memoriaAccessi[ip]) {
        memoriaAccessi[ip] = { conteggio: 1, inizioFinestra: ORA_ATTUALE };
    } else {
        if (ORA_ATTUALE - memoriaAccessi[ip].inizioFinestra > LIMITE_TEMPO) {
            memoriaAccessi[ip].conteggio = 1;
            memoriaAccessi[ip].inizioFinestra = ORA_ATTUALE;
        } else {
            memoriaAccessi[ip].conteggio++;
        }
    }

    if (memoriaAccessi[ip].conteggio > MAX_RICHIESTE) {
        req.session.errorMessage = 'Troppe richieste generali. Riprova tra un minuto.';
        return res.redirect('/account');
    }

    next();
};

//Middleware per rate limit generazione nuova chiave
const memoriaChiavi = {}; 
const limitatoreChiaviAPI = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000;
    const MAX_CHIAVI = 2;   

    if (!memoriaChiavi[ip]) {
        memoriaChiavi[ip] = { conteggio: 1, inizioFinestra: ORA_ATTUALE };
    } else {
        if (ORA_ATTUALE - memoriaChiavi[ip].inizioFinestra > LIMITE_TEMPO) {
            memoriaChiavi[ip].conteggio = 1;
            memoriaChiavi[ip].inizioFinestra = ORA_ATTUALE;
        } else {
            memoriaChiavi[ip].conteggio++;
        }
    }

    if (memoriaChiavi[ip].conteggio > MAX_CHIAVI) {
        req.session.errorMessage = '!!ATTENZIONE!! Puoi generare al massimo 2 chiavi API al minuto.';
        return res.redirect('/account');
    }

    next();
};

// --- PAGINA PROFILO (Recupera l'elenco delle chiavi dell'utente) ---
router.get('/', antispamTasto, requireLogin, rateLimiterManuale, async function(req, res) {
    try {
        const username = req.session.user.username;

        const { data: apiKeys, error } = await supabase
            .from("APIkey")
            .select("key, attiva")
            .eq("utente", username);

        if (error) throw error;

        const user = {
            nome: req.session.user.nome,
            cognome: req.session.user.cognome,
            username: req.session.user.username,
            email: req.session.user.email,
            data_nascita: req.session.user.dataNascita,
            sesso: req.session.user.sesso,
            ruolo: req.session.user.ruolo
        };

        const success = req.session.successMessage;
        const errorMsg = req.session.errorMessage;
        delete req.session.successMessage; 
        delete req.session.errorMessage;

        res.render('account', {
            title: 'Account',
            user,
            apiKeys,
            success,
            error: errorMsg
        });

    } catch (err) {
        console.error('Errore nel recupero dei dati account:', err.message);
        res.status(500).send("Errore del server");
    }
});

// --- GENERAZIONE NUOVA CHIAVE API ---
router.post('/request-api-key',  antispamTasto, requireLogin, limitatoreChiaviAPI, async (req, res) => {
    try {
        const newApiKey = crypto.randomBytes(32).toString('hex');
        const username = req.session.user.username;


        const { error } = await supabase
            .from("APIkey")
            .insert([{ key: newApiKey, attiva: true, utente: username }]);

        if (error) throw error;

        req.session.successMessage = 'Nuova chiave API generata con successo!';
        res.redirect('/account');

    } catch (err) {
        console.error("Errore generazione API Key:", err);
        req.session.errorMessage = 'Errore durante la generazione della chiave.';
        res.redirect('/account');
    }
});

// --- ATTIVA / DISATTIVA UNA CHIAVE ---
router.post('/toggle-api-key',antispamTasto, requireLogin,  async (req, res) => {
    try {
        const { apiKey, statoAttuale } = req.body;
        const username = req.session.user.username;

        const nuovoStato = statoAttuale === 'true' ? false : true;  //Inverti stato

        const { error } = await supabase
            .from("APIkey")
            .update({ attiva: nuovoStato })
            .eq("key", apiKey)
            .eq("utente", username); 

        if (error) throw error;

        req.session.successMessage = `Chiave API ${nuovoStato ? 'attivata' : 'disattivata'} con successo!`;
        res.redirect('/account');

    } catch (err) {
        console.error("Errore modifica stato API Key:", err);
        req.session.errorMessage = 'Impossibile modificare lo stato della chiave.';
        res.redirect('/account');
    }
});

// ---  ELIMINAZIONE DI UNA CHIAVE API SPECIFICA ---
router.post('/delete-api-key', antispamTasto ,requireLogin, async (req, res) => {
    try {
        const { apiKey } = req.body;
        const username = req.session.user.username;

        const { error } = await supabase
            .from("APIkey")
            .delete()
            .eq("key", apiKey)
            .eq("utente", username);

        if (error) throw error;

        req.session.successMessage = 'Chiave API eliminata permanentemente.';
        res.redirect('/account');

    } catch (err) {
        console.error("Errore eliminazione API Key:", err);
        req.session.errorMessage = 'Errore durante l\'eliminazione della chiave.';
        res.redirect('/account');
    }
});

// --- ELIMINAZIONE COMPLETA DELL'ACCOUNT ---
router.post('/delete', requireLogin, antispamTasto, async (req, res) => {
    try {
        const username = req.session.user.username;
        const email = req.session.user.email;

        const { error } = await supabase
            .from("utenti")
            .delete()
            .or(`username.eq.${username},email.eq.${email}`);
            
        if(error) throw error;

        req.session.destroy(() => {
            res.redirect("/");
        });
    } catch (err) {
        console.error('Errore eliminazione account:', err.message);
        req.session.errorMessage = 'Errore interno durante l\'eliminazione dell\'account.';
        res.redirect('/account');
    }
});

export default router;