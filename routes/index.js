var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `
    SELECT barcode, image_url FROM prodotti ORDER BY RANDOM() LIMIT 1
`;

/* GET home page. */
router.get('/', function(req, res, next) {
    try
    {
        const stmt = db.prepare(sql);
        const row = stmt.get();
        const img_url = row
            ? `/cached-images/${row.barcode}`
            : "/images/not-available.png";
        res.render('index', {
            title: 'Home',
            user: req.session?.user || null,
            img_url
        });
    }
    catch (err)
    {
        console.error("Errore index:", err.message);
        res.render('index', {
            title: 'Home',
            user: req.session?.user || null,
            img_url: "/images/not-available.png"
        });
    }
});

module.exports = router;