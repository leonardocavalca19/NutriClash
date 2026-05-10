const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const db = require("../db/database");
const router = express.Router();

const CACHE_DIR = path.join(__dirname, "../cache/images");

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
        const stmt = db.prepare(
            "SELECT image_url FROM prodotti WHERE barcode = ?"
        );
        const row = stmt.get(barcode);
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

module.exports = router;