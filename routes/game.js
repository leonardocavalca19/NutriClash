var express = require('express');
const db = require("../db/database");
var router = express.Router();

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

/* GET SAVE GAME ON DB */
router.get('/save', function(res, req, next){});

module.exports = router;
