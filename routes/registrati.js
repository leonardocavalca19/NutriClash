import express from 'express';
const router = express.Router();
import { supabase } from "../db/supabase.js";
import crypto from 'node:crypto';

//funzione per hashare la password con scrypt e salt univoco
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

router.get('/', function(req, res, next) {
    res.render('registrati', { title: 'Registrazione' });
});

router.post('/', async function(req, res) {
    console.log("Dati ricevuti:", req.body);
    const { username, nome, cognome, sesso, dataNascita, email, password } = req.body;
    try
    {
        const passwordHash = hashPassword(password);
        const { error } = await supabase
        .from("utenti")
        .insert({
            username,
            email,
            nome,
            cognome,
            dataNascita: dataNascita,
            sesso,
            password: passwordHash,
            ruolo: "user"
        });
        if(error) throw error;
        console.log("Utente registrato con successo");
        return res.redirect('/login');
    }
    catch (err)
    {
        let messaggioErrore = "Errore durante la registrazione."; 
        // gestione errori UNIQUE
        if(err.code === "23505") {
            if(err.message.includes("username"))
            {
                messaggioErrore = "Lo username è già occupato.";
            }
            else if(err.message.includes("email"))
            {
                messaggioErrore = "L'email è già registrata.";
            }
        }
        return res.render('registrati', {
            title: 'Registrazione',
            error: messaggioErrore,
            dati: req.body
        });
    }
});
export default router;