var express = require('express');
const db = require("../db/database");
var router = express.Router();

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

/* GET game page. */
router.get('/', function(req, res, next) {
    res.render('game', { title: 'NutriClash - Game' });
});

/* GET products array */
router.get('/call', function(req, res, next){
    const sql = 'SELECT * FROM prodotti ORDER BY RANDOM() LIMIT 100';

    db.all(sql, [], (err, rows) => {
        if(err) { console.error("Errore nella raccolta dei dati: ", err.message); return; }

        const list = rows.map(row => ({
            barcode: row.barcode,
            image_url: row.image_url,
            product_name: row.product_name,
            product_name_it: row.product_name_it,
            nutriscore_grade: row.nutriscore_grade
        }));
        res.json(list);
    });
});

/* POST loads defeat screen */
router.post('/lost', function(req, res, next){ res.render("lost", {data: req.body}); });

/* GET SAVE GAME ON DB */
router.get('/save', function(res, req, next){});

/* POST checks the click of the user */
router.post('/check', express.json(), (req, res) => {
    const { p1, p2, scelta } = req.body;

    const sql = `SELECT barcode, nutriscore_grade FROM prodotti WHERE barcode IN (?, ?)`;

    db.all(sql, [p1, p2], (err, rows) => {
        if (err) return res.status(500).json({ error: "Errore DB" });

        const valoriNScore = { e: 0, d: 1, c: 2, b: 3, a: 4 };

        const prod1 = rows.find(r => r.barcode === p1);
        const prod2 = rows.find(r => r.barcode === p2);

        const scores = [
            valoriNScore[prod1.nutriscore_grade],
            valoriNScore[prod2.nutriscore_grade]
        ];

        const otherIndex = scelta === 0 ? 1 : 0;

        const win = scores[scelta] >= scores[otherIndex] ? true : false;

        if(!req.session.punteggio)
        {
            req.session.punteggio = 0;
        }

        if(win)
        {
            req.session.punteggio++;
        }

        res.json({
            win,
            punteggio: req.session.punteggio,
            logged: !!req.session.user
        });
    });
});

router.post('/finish', (req, res) => {
    const punteggio = req.body.punteggio || 0;
    const tempo = req.body.tempo || 0;
    const username = req.session?.user?.username;

    // reset sempre la partita
    req.session.punteggio = 0;
    req.session.tempo = 0;

    if (!username) {
        return res.json({ saved: false });
    }

    const sql = `
        INSERT INTO partita (punteggio, tempo, username)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [punteggio, tempo, username], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json({
            saved: true
            //TODO portare i valori alla pagina successiva per il riepilogo partita
        });
    });
});

module.exports = router;