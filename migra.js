import Database from "better-sqlite3";
import { supabase } from "./db/supabase.js";
const sqlite = new Database("./db/database.db");

const rows = sqlite
    .prepare("SELECT * FROM partita")
    .all();

console.log(`Trovate ${rows.length} righe`);

const chunkSize = 500;

for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    const { error } = await supabase
        .from("partita")
        .insert(chunk);

    if (error) {
        console.error("Errore batch:", error);
    } else {
        console.log(`Inseriti ${i + chunk.length}/${rows.length}`);
    }
}