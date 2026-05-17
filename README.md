# NutriClash

**NutriClash** è una piattaforma web interattiva progettata per sensibilizzare studenti e cittadini sull'importanza di una corretta alimentazione e sull'utilizzo del sistema **Nutriscore**. Attraverso un mix di contenuti educativi e gamification, il progetto mira a rendere l'educazione alimentare un'esperienza accessibile e coinvolgente.

---

## 🚀 Funzionalità principali
- **Pagine Informative**: Guide dettagliate per interpretare correttamente le etichette alimentari e l'algoritmo Nutriscore.
- **Gioco Interattivo**: Un'esperienza ludica per mettere alla prova le proprie conoscenze e imparare a comporre pasti equilibrati.
- **Sistema di Punteggio**: Tracciamento dei risultati degli utenti tramite database per monitorare i progressi.
- **Design Moderno e Responsive**: Interfaccia ottimizzata per la fruizione sia da desktop che da dispositivi mobile.

## 🛠️ Stack Tecnologico
- **Frontend**: EJS, CSS3 (Validato W3C), JavaScript.
- **Templating Engine**: [EJS](https://ejs.co/) (Embedded JavaScript).
- **Backend**: [Node.js](https://nodejs.org/) con framework Express.js.
- **Database**: Database Relazionale (MySQL) per la gestione sicura e coerente di utenti, prodotti e partite.

## 📂 Struttura del Progetto
```text
nutriclash/
├── public/              # File statici (CSS, Immagini, Script JS client-side)
├── views/               # Template EJS (Pagine del sito)
├── routes/              # Gestione delle rotte e logica applicativa
├── models/              # Schemi e interazioni con il Database
├── app.js               # Punto di ingresso dell'applicazione (Node.js)
└── package.json         # Gestione delle dipendenze e script
