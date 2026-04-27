const fs = require('fs');
const path = require('path');
const db = require('./database');


function seedDatabase()
{
    const filePath = path.resolve(__dirname, 'prodotti.json');
    const prodotti = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const sql = `
    INSERT OR IGNORE INTO prodotti 
    (barcode, image_url, product_name, product_name_it, nutriscore_grade)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        prodotti.forEach(p => {
            db.run(sql, [
            p.code,
            p.image_url,
            p.product_name,
            p.product_name_it,
            p.nutriscore_grade
            ]);
        });

        db.run("COMMIT", () => {
            console.log("Import completato");
        });
    });
}

module.exports = seedDatabase();