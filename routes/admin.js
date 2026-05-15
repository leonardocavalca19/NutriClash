import express from 'express';
const router = express.Router();
import { supabase } from "../db/supabase.js";

function requireLogin(req, res, next) {

    console.log(req.session.user.ruolo);
    if (!req.session || req.session.user.ruolo === "user") {
        return res.redirect('/');
    }

    next();
}

/* GET home page. */
router.get('/', requireLogin, async function(req, res, next) {
    try
    {
        const { data: rows, error } = await supabase
        .from("utenti")
        .select("username, nome, cognome, email, dataNascita, sesso, ruolo")
        if(error) throw error;

        res.render("admin", { title: "Amministratore", user: req.session.user, users: rows });
    }
    catch (error)
    {
        console.error("Errore index:", err.message);
        res.render('index', {
            title: 'Home',
            user: req.session?.user || null,
            img_url: "/images/not-available.png"
        });
    }
});
router.post("/cambia-ruolo", express.json(), async (req, res) => {
    try
    {
        const currentUser = req.session.user;
        if(!currentUser) {
            return res.status(401).json({
                success: false,
                error: "Non autenticato"
            });
        }

        const { username, ruolo } = req.body;
        const { data: targetUser, error } = await supabase
        .from("utenti")
        .select("username, ruolo")
        .eq("username", username)
        .maybeSingle();

        if(error || !targetUser)
        {
            return res.status(404).json({
                success: false,
                error: "Utente non trovato"
            });
        }

        if(currentUser.ruolo !== "owner" && targetUser.ruolo === "owner")
        {
            return res.status(403).json({
                success: false,
                error: "Non autorizzato"
            });
        }

        if(currentUser.username === username)
        {
            return res.status(403).json({
                success: false,
                error: "Non puoi modificare il tuo ruolo"
            });
        }
        const { error: updateError } = await supabase
        .from("utenti")
        .update({ ruolo })
        .eq("username", username);
        if(updateError) throw updateError;

        res.json({
            success: true
        });
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Errore server"
        });
    }
});

export default router;