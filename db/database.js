const Database = require("better-sqlite3")
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");

const db = new Database(dbPath);

function createTabella()
{
    const sqlProdotti = `
        CREATE TABLE IF NOT EXISTS prodotti (
            barcode TEXT PRIMARY KEY,
            image_url TEXT,
            product_name TEXT,
            product_name_it TEXT,
            nutriscore_grade TEXT
        )
    `;

    const sqlUtenti = `
        CREATE TABLE IF NOT EXISTS utenti (
            username TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            dataNascita DATE NOT NULL,
            sesso TEXT NOT NULL,
            password TEXT NOT NULL,
            apiKey TEXT
        )
    `;

    const sqlPartita = `
        CREATE TABLE IF NOT EXISTS partita (
            idPartita INTEGER PRIMARY KEY AUTOINCREMENT,
            punteggio INTEGER NOT NULL,
            tempo INTEGER NOT NULL,
            username TEXT NOT NULL REFERENCES utenti(username)
        )
    `;

    try
    {
        db.exec(sqlProdotti);
        db.exec(sqlUtenti);
        db.exec(sqlPartita);
        console.log("Database inizializzato correttamente.");
    }
    catch (err)
    {
        console.error("Errore creazione tabelle:", err.message);
    }
}

createTabella();

module.exports = db;