document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    const email = document.getElementById('email');

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // Formato email standard

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

        // 1. Validazione Email
        if (!regexEmail.test(email.value)) {
            errori.push("Formato email non valido.");
        }

        if (errori.length > 0) {
                    event.preventDefault(); 
                    
                    errorBox.innerHTML = errori.join('<br>');
                    errorBox.style.display = 'block';
        }
    });
});