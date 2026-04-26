const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if(err)
    {
        console.log("Errore connessione DB: ", err.message);
    }
    else
    {
        console.log("Connesso con successo al database SQLite3.");
        createTabella();
    }
});

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
            email TEXT NOT NULL,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            eta INTEGER NOT NULL
        )
    `

    db.serialize(()=>{
        db.run(sqlProdotti, (err)=>{ if(err){ console.log("Errore creazione tabella: ", err.message) } });
        db.run(sqlUtenti, (err)=>{ if(err){ console.log("Errore creazione tabella: ", err.message) } });
    });
}

module.exports = db;