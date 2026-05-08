var express = require('express');
var router = express.Router();
const db = require('../db/database');


const sqlClassifica = `
    SELECT p.username, p.punteggio, p.tempo
    FROM Partita p
    INNER JOIN (
        SELECT username, MAX(punteggio) as max_punteggio
        FROM Partita
        GROUP BY username
    ) as miglior_partita ON p.username = miglior_partita.username 
    AND p.punteggio = miglior_partita.max_punteggio
    ORDER BY p.punteggio DESC, p.tempo ASC
    LIMIT 10;`;


const sqlUtente = `
    WITH MiglioriPartite AS (                   
         SELECT username, MAX(punteggio) as max_punteggio, MIN(tempo) as min_tempo  
        GROUP BY username
    )
    SELECT 
        (SELECT COUNT(*) FROM MiglioriPartite m2 
         WHERE m2.max_punteggio > m1.max_punteggio 
         OR (m2.max_punteggio = m1.max_punteggio AND m2.min_tempo < m1.min_tempo)) + 1 AS posizione_reale,
        m1.username, m1.max_punteggio as punteggio, m1.min_tempo as tempo
    FROM MiglioriPartite m1
    WHERE m1.username = ?`;
        

router.get('/', function(req, res, next) {

    db.all(sqlClassifica, [], (err, rows) => {
        if (err) {
            console.error("Errore nella query classifica:", err);
            return res.status(500).send("Errore del server");
        }
        
        if (req.session.user) {
        db.get(sqlUtente, [req.session.user.username], (err, userRow) => {
                    if (err) {
                        console.error("Errore nella query utente:", err);
                        return res.status(500).send("Errore del server");
                    }

                    res.render('classifica', { title: 'Classifica', classifica: rows, user: userRow || null });
                });
        } 
        else {
            res.render('classifica', { title: 'Classifica', classifica: rows, user: null });
        }
        
    });
});

module.exports = router;