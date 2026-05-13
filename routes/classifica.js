var express = require('express');
var router = express.Router();
const db = require('../db/database');
const MAX_LENGTH = 20;

const sql = `
    SELECT username, punteggio, tempo
    FROM partita
    ORDER BY punteggio DESC, tempo ASC
    LIMIT ?
`;

router.get('/', function(req, res) {

    try
    {
        const topStmt = db.prepare(sql);
        const rows = topStmt.all(MAX_LENGTH);
        const loggedUser = req.session?.user?.username;
        const isInTop = rows.some(r => r.username === loggedUser);
        // se l'utente non è loggato o è in top
        if (!loggedUser || isInTop) {
            return res.render('classifica', {
                title: 'Classifica - NutriClash',
                classifica: rows,
                userRow: null,
                MAX_LENGTH: MAX_LENGTH
            });
        }
        // se l'utente non è loggato, quety per ottenere il suo punteggio migliore e poi query per la sua relativa posizione
        const sqlUserBest = `
            SELECT username, punteggio, tempo
            FROM partita
            WHERE username = ?
            ORDER BY punteggio DESC, tempo ASC
            LIMIT 1
        `;
        const userStmt = db.prepare(sqlUserBest);
        const userRow = userStmt.get(loggedUser);
        if (!userRow) {
            return res.render('classifica', {
                title: 'Classifica - NutriClash',
                classifica: rows,
                userRow: null,
                MAX_LENGTH: MAX_LENGTH
            });
        }
        const sqlPosition = `
            SELECT COUNT(*) + 1 AS posizione
            FROM partita
            WHERE punteggio > ?
            OR (punteggio = ? AND tempo < ?)
        `;
        const posStmt = db.prepare(sqlPosition);
        const posRow = posStmt.get(
            userRow.punteggio,
            userRow.punteggio,
            userRow.tempo
        );
        return res.render('classifica', {
            title: 'Classifica - NutriClash',
            classifica: rows,
            userRow: userRow,
            posizione: posRow.posizione,
            MAX_LENGTH: MAX_LENGTH
        });
    }
    catch (err)
    {
        console.error("Errore classifica:", err.message);
        return res.status(500).send("Errore del server");
    }
});

module.exports = router;