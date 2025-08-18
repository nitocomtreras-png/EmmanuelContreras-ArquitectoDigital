// assets/js/admin-auth.js

// Importa las funciones de Firebase que necesitas
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// --- Lógica para la página de Login (admin.html) ---
// Esta parte solo se ejecuta si encuentra el formulario de login en la página.
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Si las credenciales son correctas, te lleva al dashboard.
                window.location.href = '/EmmanuelContreras-ArquitectoDigital/dashboard.html';
            })
            .catch((error) => {
                // Si las credenciales son incorrectas, muestra un error.
                errorMessage.textContent = 'Error: Credenciales incorrectas.';
                console.error("Error de autenticación:", error);
            });
    });
}

// --- Lógica para Proteger Rutas y Cerrar Sesión ---
// Esta parte solo se ejecuta si estás en la página del dashboard.
if (window.location.pathname.includes('/dashboard.html')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Si no hay un usuario con sesión iniciada, te expulsa a la página de login.
            window.location.href = '/EmmanuelContreras-ArquitectoDigital/admin.html';
        }
    });

    // Este código crea y añade el botón de "Cerrar Sesión" en la esquina del dashboard.
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Cerrar Sesión';
    logoutButton.className = 'button button--secondary';
    logoutButton.style.position = 'fixed';
    logoutButton.style.bottom = '20px';
    logoutButton.style.right = '20px';

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Al cerrar sesión, te redirige de vuelta al login.
            window.location.href = '/EmmanuelContreras-ArquitectoDigital/admin.html';
        });
    });

    document.body.appendChild(logoutButton);
}