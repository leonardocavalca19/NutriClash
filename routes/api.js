var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `SELECT barcode, product_name_it, nutriscore_grade FROM prodotti WHERE barcode = ?`;


//Middleware per controllare la chiave API
const controllaApiKey = (req, res, next) => {
    const API_KEY_SEGRETA = "clash2026";
    const chiaveFornita = req.query.key;

    if (!chiaveFornita) {
        return res.status(401).json({ error: "Accesso negato. Manca la chiave." });
    }
    if (chiaveFornita !== API_KEY_SEGRETA) {
        return res.status(403).json({ error: "API Key non valida." });
    }
    next();
};

//Middleware per limitare le richieste (rate limiting) manuale
const memoriaAccessi = {};
const rateLimiterManuale = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000; 
    const MAX_RICHIESTE = 10;   

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
        return res.status(429).json({ 
            error: "Troppe richieste. Riprova tra un minuto." 
        });
    }

    next();
};


router.get('/', function(req, res, next) {
    res.render('api', { title: 'API Docs', user: req.session?.user || null });
});

// Risponde a: GET /api/compara?code1=...&code2=...&key=...
router.get('/compara', rateLimiterManuale, controllaApiKey, (req, res) => {
    const { code1, code2 } = req.query;

    if (!code1 || !code2) {
        return res.status(400).json({ error: "Fornire entrambi i barcode (code1 e code2)" });
    }

    db.get(sql, [code1], (err, row1) => {
        if (err) return res.status(500).json({ error: "Errore DB 1" });
        if (!row1) return res.status(404).json({ error: `Prodotto ${code1} non trovato` });

        db.get(sql, [code2], (err, row2) => {
            if (err) return res.status(500).json({ error: "Errore DB 2" });
            if (!row2) return res.status(404).json({ error: `Prodotto ${code2} non trovato` });


            const punteggio1 = row1.nutriscore_grade;
            const punteggio2 = row2.nutriscore_grade;

            let vincitore;
            if (punteggio1 === punteggio2) {
                vincitore = "Pareggio";
            } else {
                vincitore = punteggio1 < punteggio2 ? row1.product_name_it : row2.product_name_it;
            }

            // 4. Risposta finale
            res.json({
                success: true,
                risultato: punteggio1 === punteggio2 ? "Pareggio" : "Vincitore trovato",
                vincitore: vincitore,
                dettagli: { 
                    prodotto1: row1, 
                    prodotto2: row2 
                }
            });
        });
    });
});

module.exports = router;