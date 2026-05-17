import express from 'express';
import { supabase } from "../db/supabase.js";
const router = express.Router();

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

/* GET game page. */
router.get('/', function(req, res, next) {
    res.render('game', { title: 'NutriClash - Game', user: req.session?.user || null });
});

/* GET products array */
router.get('/call', async function(req, res, next){

    try
    {
        const { data, error } = await supabase
        .from("prodotti")
        .select(`
            barcode,
            image_url,
            product_name,
            product_name_it,
            nutriscore_grade
        `)
        .limit(200);

    if (error) throw error;

        const shuffled = data
            .sort(() => 0.5 - Math.random())
            .slice(0, 100);
        const list = shuffled.map(row => ({
            barcode: row.barcode,
            image_url: row.image_url,
            product_name: row.product_name,
            product_name_it: row.product_name_it,
            nutriscore_grade: row.nutriscore_grade
        }));
        res.json(list);
    }
    catch (err)
    {
        console.error("Errore query prodotti:", err.message);
        res.status(500).json({ error: "DB error" });
    }
});

/* POST loads defeat screen */
router.post('/lost', function(req, res, next){ res.render("lost", {data: req.body}); });

/* POST checks the click of the user */
router.post('/check', express.json(), async (req, res) => {
    const { p1, p2, scelta } = req.body;

    try
    {
        const { data: rows, error } = await supabase
            .from("prodotti")
            .select("barcode, nutriscore_grade")
            .in("barcode", [p1, p2]);

        if (error) throw error;

        const valoriNScore = {
            e: 0,
            d: 1,
            c: 2,
            b: 3,
            a: 4
        };
        const prod1 = rows.find(r => r.barcode === p1);
        const prod2 = rows.find(r => r.barcode === p2);
        const scores = [
            valoriNScore[prod1.nutriscore_grade],
            valoriNScore[prod2.nutriscore_grade]
        ];
        const otherIndex = scelta === 0 ? 1 : 0;
        const win = scores[scelta] >= scores[otherIndex];
        res.json({
            win,
            logged: !!req.session.user
        });
    }
    catch (err)
    {
        console.error("Errore DB:", err.message);
        res.status(500).json({ error: "Errore DB" });
    }
});

router.post('/finish', async (req, res) => {
    const username = req.session?.user?.username;
    if (!username) {
        return res.json({ saved: false });
    }

    const punteggio = Number(req.body.punteggio) || 0;
    const tempo = Number(req.body.tempo) || 0;

    try {
        const { data: existing, error } = await supabase
            .from("partita")
            .select("punteggio, tempo")
            .eq("username", username)
            .maybeSingle();

        if (error) throw error;

        if (!existing) {
            console.log("non esiste, aggiungo al DB");
            const { error } = await supabase
                .from("partita")
                .insert({
                    username,
                    punteggio,
                    tempo
                });
            if(error) throw error;

            return res.json({ saved: true, newRecord: true });
        }

        const isBetter = punteggio > existing.punteggio || (punteggio === existing.punteggio && tempo < existing.tempo);

        if (!isBetter) {
            return res.json({ saved: true, newRecord: false });
        }

        await supabase
            .from("partita")
            .update({ punteggio, tempo })
            .eq("username", username);

        return res.json({ saved: true, newRecord: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
    }
});

export default router;