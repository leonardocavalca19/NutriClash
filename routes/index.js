var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `
    SELECT image_url FROM prodotti ORDER BY RANDOM() LIMIT 1
`;

/* GET home page. */
router.get('/', function(req, res, next) {
    db.all(sql, [], (err, row) => {
        console.log(row.image_url);
        res.render('index', { title: 'Home', user: req.session?.user || null, img_url: row[0].image_url });
    });
});

module.exports = router;