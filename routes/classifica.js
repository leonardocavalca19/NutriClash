import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
const MAX_LENGTH = 20;

router.get("/", async function (req, res) {

    try {
        const { data: allScores, error } = await supabase
            .from("partita")
            .select("username, punteggio, tempo");

        if (error) throw error;

        if (!allScores) {
            return res.render("classifica", {
                title: "Classifica",
                classifica: [],
                userRow: null,
                posizione: null,
                MAX_LENGTH,
                user: req.session?.user
            });
        }

        const sorted = allScores.sort((a, b) => {

            if (b.punteggio !== a.punteggio) {
                return b.punteggio - a.punteggio;
            }

            return a.tempo - b.tempo;
        });

        const top = sorted.slice(0, MAX_LENGTH);

        const loggedUser = req.session?.user?.username;

        // 4. utente loggato
        let userRow = null;
        let posizione = null;

        if (loggedUser) {

            const index = sorted.findIndex(
                p => p.username === loggedUser
            );

            if (index !== -1) {
                userRow = sorted[index];
                posizione = index + 1;
            }
        }

        return res.render("classifica", {
            title: "Classifica - NutriClash",
            classifica: top,
            userRow,
            posizione,
            MAX_LENGTH,
            user: req.session?.user
        });

    } catch (err) {
        console.error("Errore classifica:", err.message);

        return res.status(500).send("Errore server");
    }
});

export default router;