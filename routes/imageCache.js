import express from 'express';
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import { supabase } from "../db/supabase.js";
const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

const CACHE_DIR = path.join(__dirname, "../cache/images");
if(!fs.existsSync(CACHE_DIR))
{
    fs.mkdirSync(CACHE_DIR, {recursive: true});
}

router.get("/:barcode", async (req, res) => {
    const barcode = req.params.barcode;
    const localPath = path.join(CACHE_DIR, `${barcode}.jpg`);
    
    //se è già in cache
    if (fs.existsSync(localPath))
    {
        return res.sendFile(localPath);
    }

    try
    {
        const { data: row, error } = await supabase
            .from("prodotti")
            .select("image_url")
            .eq("barcode", barcode)
            .maybeSingle();

        if (error) throw error;

        if (!row || !row.image_url) {
            return res.status(404).send("Immagine non trovata");
        }
        const imageUrl = row.image_url;
        const file = fs.createWriteStream(localPath);
        https.get(imageUrl, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(localPath, () => {});
                return res.status(404).send("Errore download");
            }
            response.pipe(file);
            file.on("finish", () => {
                file.close(() => {
                    res.setHeader(
                        "Cache-Control",
                        "public, max-age=31536000"
                    );
                    res.sendFile(localPath);
                });
            });
        }).on("error", () => {
            fs.unlink(localPath, () => {});
            res.status(500).send("Errore interno server");
        });
    }
    catch (err)
    {
        console.error("Errore DB:", err.message);
        res.status(500).send("Errore server");
    }
});

export default router;