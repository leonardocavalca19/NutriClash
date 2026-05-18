export const memoriaSpam = {};

export const controllaSeBannato = (req, res, next) => {
    const ip = req.ip; 
    const ORA_ATTUALE = Date.now();

    if (memoriaSpam[ip] && memoriaSpam[ip].bannatoFinoA > ORA_ATTUALE) {
        const millisecondiMancanti = memoriaSpam[ip].bannatoFinoA - ORA_ATTUALE;
        const secondiTotali = Math.ceil(millisecondiMancanti / 1000);
        
        return res.status(403).render('ban', { secondiTotali });
    }
    next();
};

export const incrementaClickTasto = (req, res, next) => {
    const ip = req.ip;
    const ORA_ATTUALE = Date.now();
    const LIMITE_TEMPO = 60000;         
    const MAX_RICHIESTE = 15;           
    const DURATA_BAN = 15 * 60 * 1000;  

    if (!memoriaSpam[ip]) {
        memoriaSpam[ip] = { conteggio: 1, inizioFinestra: ORA_ATTUALE, bannatoFinoA: 0 };
    } else {
        if (ORA_ATTUALE - memoriaSpam[ip].inizioFinestra > LIMITE_TEMPO) {
            memoriaSpam[ip].conteggio = 1;
            memoriaSpam[ip].inizioFinestra = ORA_ATTUALE;
        } else {
            memoriaSpam[ip].conteggio++;
        }
    }

    if (memoriaSpam[ip].conteggio > MAX_RICHIESTE) {
        memoriaSpam[ip].bannatoFinoA = ORA_ATTUALE + DURATA_BAN;
        const secondiTotali = Math.ceil(DURATA_BAN / 1000);
        return res.status(403).render('ban', { secondiTotali });
    }
    next();
};