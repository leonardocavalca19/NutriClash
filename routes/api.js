import express from 'express';
const router = express.Router();
import { supabase } from "../db/supabase.js";

// --- MIDDLEWARE PER IL CONTROLLO DELLA CHIAVE API ---
async function controllaApiKey (req, res, next) {
    const chiaveFornita = req.query.key;

    if (!chiaveFornita) {
        return res.status(401).json({ error: "Accesso negato. Manca la chiave." });
    }

    try {
        console.log("2. INVIO QUERY A SUPABASE...");
        const { data: apiKeyRecord, error } = await supabase
            .from("APIkey") 
            .select("key, attiva")
            .eq("key", chiaveFornita)
            .maybeSingle();

        if (error) console.error("ERR. ERRORE DI SUPABASE:", error.message);

        if (error || !apiKeyRecord) {
            return res.status(403).json({ error: "API Key non valida o inesistente." });
        }

        console.log("4. STATO CHIAVE NEL DB:", apiKeyRecord.attiva);
        if (apiKeyRecord.attiva !== true) {
            console.log("X. BLOCCO: La chiave è registrata ma DISATTIVATA");
            return res.status(403).json({ error: "Questa API Key è stata disattivata dall'utente." });
        }

        next();
        
    } catch (err) {
        console.error("ERRORE GRAVE NEL MIDDLEWARE:", err);
        return res.status(500).json({ error: "Errore interno del server." });
    }
}

// --- MIDDLEWARE RATE LIMITING MANUALE ---
const memoriaAccessi = {};
const rateLimiterManuale = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000; 
    const MAX_RICHIESTE = 10;   

    console.log(`IP ${ip} ha fatto una richiesta. Conteggio attuale: ${memoriaAccessi[ip]?.conteggio || 0}`);

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
        return res.status(429).json({ 
            error: "Troppe richieste. Riprova tra un minuto." 
        });
    }

    next();
};

// --- ROTTE ---

router.get('/', function(req, res, next) {
    res.render('api', { title: 'API Docs', user: req.session?.user || null });
});

// Risponde a: GET /api/compara?code1=...&code2=...&key=...
router.get('/compara', rateLimiterManuale, controllaApiKey, async (req, res) => {
    const { code1, code2 } = req.query;

    if (!code1 || !code2) {
        return res.status(400).json({
            error: "Fornire entrambi i barcode (code1 e code2)"
        });
    }

    try {
        const { data: prodotti, error } = await supabase
            .from("prodotti")
            .select("barcode, product_name_it, nutriscore_grade")
            .in("barcode", [code1, code2]);

        if (error) throw error;

        const row1 = prodotti.find(p => p.barcode === code1);
        const row2 = prodotti.find(p => p.barcode === code2);

        if (!row1) {
            return res.status(404).json({
                error: `Prodotto ${code1} non trovato`
            });
        }
        if (!row2) {
            return res.status(404).json({
                error: `Prodotto ${code2} non trovato`
            });
        }
        
        const punteggio1 = row1.nutriscore_grade;
        const punteggio2 = row2.nutriscore_grade;
        let vincitore;
        
        if (punteggio1 === punteggio2) {
            vincitore = "Pareggio";
        } else {
            vincitore = punteggio1 < punteggio2
                ? row1.product_name_it
                : row2.product_name_it;
        }
        
        res.json({
            success: true,
            risultato: punteggio1 === punteggio2
                ? "Pareggio"
                : "Vincitore trovato",
            vincitore,
            dettagli: {
                prodotto1: row1,
                prodotto2: row2
            }
        });
    }
    catch (err) {
        console.error("Errore DB:", err.message);
        res.status(500).json({
            error: "Errore interno DB"
        });
    }
});

export default router;