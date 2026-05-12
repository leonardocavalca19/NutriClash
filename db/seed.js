const fs = require('fs');
const path = require('path');
const db = require('./database');
const crypto = require('node:crypto');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

function seedDatabase()
{
    const filePath = path.resolve(__dirname, 'prodotti.json');
    const prodotti = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const sql = `
    INSERT OR IGNORE INTO prodotti 
    (barcode, image_url, product_name, product_name_it, nutriscore_grade)
    VALUES (?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    //transazione per inserimento nel database
    const insertMany = db.transaction((items) => {
        for (const p of items) {
            stmt.run(
                p.code,
                p.image_url,
                p.product_name,
                p.product_name_it,
                p.nutriscore_grade
            );
        }
    });

    insertMany(prodotti);

    console.log("Import prodotti completato");

}

function seedUsers()
{
    const filePath = path.resolve(__dirname, 'amministratori.json');
    const prodotti = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const sql = `
        INSERT OR IGNORE INTO utenti 
        (username, email, nome, cognome, dataNascita, sesso, password, apikey, ruolo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    //transazione per inserimento nel database
    const insertMany = db.transaction((items) => {
        for (const p of items) {
            stmt.run(
                p.username,
                p.email,
                p.nome,
                p.cognome,
                p.dataNascita,
                p.sesso,
                hashPassword(p.password),
                p.apiKey,
                p.ruolo
            );
        }
    });

    insertMany(prodotti);

    console.log("Import utenti completato");
}

module.exports = seedDatabase(), seedUsers();