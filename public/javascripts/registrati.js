document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');


    const nome = document.getElementById('Nome');
    const cognome = document.getElementById('Cognome');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confermaPassword = document.getElementById('confermaPassword');

    const regexNomeCognome = /^[A-Za-zÀ-ÿ\s']{2,30}$/; // Lettere, accenti, spazio, min 2 caratteri
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // Formato email standard
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 caratteri, almeno una lettera e un numero

    let errorBox = document.querySelector('.error-message');

    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.className = 'error-message';
        errorBox.style.display = 'none'; // Lo teniamo nascosto finché non serve
        // Lo inseriamo dentro la login-box, prima del form
        form.parentNode.insertBefore(errorBox, form);
    }

    form.addEventListener('submit', (event) => {
        let errori = [];

        // 1. Validazione Nome e Cognome
        if (!regexNomeCognome.test(nome.value)) {
            errori.push("Il nome non è valido (usa solo lettere, min 2).");
        }
        if (!regexNomeCognome.test(cognome.value)) {
            errori.push("Il cognome non è valido.");
        }

        // 2. Validazione Email
        if (!regexEmail.test(email.value)) {
            errori.push("Inserisci un indirizzo email valido.");
        }

        // 3. Validazione Password
        if (!regexPassword.test(password.value)) {
            errori.push("La password deve contenere almeno 8 caratteri, tra cui lettere e numeri.");
        }

        // 4. Controllo uguaglianza Password
        if (password.value !== confermaPassword.value) {
            errori.push("Le password non coincidono.");
        }

        if (errori.length > 0) {
                    event.preventDefault(); 
                    
                    errorBox.innerHTML = errori.join('<br>');
                    errorBox.style.display = 'block';
        }
    });
});
