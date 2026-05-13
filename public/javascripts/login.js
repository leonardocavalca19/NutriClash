document.addEventListener('DOMContentLoaded', function() {
    
    //Getione per la pagina di REGISTRAZIONE (icone con classe)
    const registerEyes = document.querySelectorAll('.toggle-password-reg');
    registerEyes.forEach(eye => {
        eye.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');    //Cerca l'input che sta nello stesso div 'password-wrapper'
            toggleVisibility(input, this);
        });
    });

    //Getione per la pagina di LOGIN (icona con ID)
    const loginEye = document.querySelector('#togglePassword');
    if (loginEye) {
        loginEye.addEventListener('click', function() {
            const input = document.querySelector('#password');
            toggleVisibility(input, this);
        });
    }

    //Funzione universale per cambiare tipo e icona
    function toggleVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
});