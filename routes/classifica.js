var express = require('express');
var router = express.Router();
const db = require('../db/database');
const MAX_LENGTH = 10;

const sql = `
    SELECT username, punteggio, tempo
    FROM partita
    ORDER BY punteggio DESC, tempo ASC
    LIMIT ?
`;

router.get('/', function(req, res, next) {

    db.all(sql, [MAX_LENGTH], (err, rows) => {
        if (err)
        {
            console.error("Errore nella query classifica:", err);
            return res.status(500).send("Errore del server");
        }
        const loggedUser = req.session?.user?.username;
        const isInTopTen = rows.some(r => r.username === loggedUser);
        if(req.session?.user && !isInTopTen)
        {
            const sqlUserBest = `
                SELECT username, punteggio, tempo
                FROM partita
                WHERE username = ?
                ORDER BY punteggio DESC, tempo ASC
                LIMIT 1
            `;
            db.get(sqlUserBest, [loggedUser], (err, userRow) => {
                if(err) {
                    console.error(err);
                }
                if(!userRow)
                {
                    return res.render('classifica', { title: 'Classifica', classifica: rows, userRow: null, MAX_LENGTH: MAX_LENGTH });
                }
                const sqlPosition = `
                    SELECT COUNT(*) + 1 AS posizione
                    FROM partita
                    WHERE punteggio > ? OR (punteggio = ? AND tempo < ?)
                `;
                db.get(sqlPosition, [userRow.punteggio, userRow.punteggio, userRow.tempo], (err, posRow) => {
                    if(err) {
                        console.error(err);
                    }
                    res.render('classifica', { title: 'Classifica', classifica: rows, userRow: userRow || null, posizione: posRow.posizione, MAX_LENGTH: MAX_LENGTH });
                });
            });
        }
        else res.render('classifica', { title: 'Classifica', classifica: rows, userRow: null, MAX_LENGTH: MAX_LENGTH });
    });
});

module.exports = router;