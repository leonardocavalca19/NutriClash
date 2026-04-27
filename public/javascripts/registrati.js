document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    const nome = document.getElementById('Nome');
    const cognome = document.getElementById('Cognome');
    const dataNascita = document.getElementById('dataNascita');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confermaPassword = document.getElementById('confermaPassword'); 

    // Regex
    const regexNomeCognome = /^[A-Za-zÀ-ÿ\s']{2,30}$/;    // Accetta lettere, spazi e apostrofi (da 2 a 30 caratteri)
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;        // Struttura standard email: testo@testo.dominio
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;     // Minimo 8 caratteri, almeno una lettera e un numero

    //creazione dell'elemento per mostrare errori
    let errorBox = document.querySelector('.error-message');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.className = 'error-message';
        errorBox.style.display = 'none';
        form.parentNode.insertBefore(errorBox, form);
    }

    form.addEventListener('submit', (event) => {
        let errori = [];

        // Validazione dati
        if (!regexNomeCognome.test(nome.value)) errori.push("Il nome non è valido.");
        if (!regexNomeCognome.test(cognome.value)) errori.push("Il cognome non è valido.");
        if (!regexEmail.test(email.value)) errori.push("Email non valida.");
        if (!regexPassword.test(password.value)) errori.push("La password deve avere almeno 8 caratteri, lettere e numeri.");
        if (password.value !== confermaPassword.value) errori.push("Le password non coincidono.");


        const sessoSelezionato = document.querySelector('input[name="sesso"]:checked');
        if (!sessoSelezionato) {
            errori.push("Seleziona il tuo sesso.");
        }

        const oggi = new Date().toISOString().split('T')[0];
        if (!dataNascita.value) {
            errori.push("Inserisci la data di nascita.");
        } else if (dataNascita.value > oggi || dataNascita.value < "1930-01-01") {  // Verifica che la data non sia nel futuro o troppo remota
            errori.push("Data di nascita non valida.");
        }

        // controllo errori prima di inviare il form
        if (errori.length > 0) {
            event.preventDefault(); 
            errorBox.innerHTML = errori.join('<br>');
            errorBox.style.display = 'block';
            window.scrollTo(0, 0); 
        }
    });
});
