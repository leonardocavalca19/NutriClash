import express from 'express';
const router = express.Router();
import { supabase } from "../db/supabase.js";

/* GET home page. */
router.get('/', async function(req, res, next) {
    try
    {
        const { data, error } = await supabase
            .from("prodotti")
            .select("barcode, image_url")
            .limit(100); // puoi aumentare o diminuire

    if (error) throw error;

    if (!data || data.length === 0) {
        return res.render("index", {
            title: "Home",
            user: req.session?.user || null,
            img_url: "/images/not-available.png"
        });
    }

    const index = Math.floor(Math.random() * data.length);
    const product = data[index];

    const img_url = product
        ? product.image_url
        : "/images/not-available.png";

        return res.render('index', {
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

export default router;