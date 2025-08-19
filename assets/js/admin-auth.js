// assets/js/admin-auth.js

// Importa las funciones de Firebase que necesitas (¡hemos añadido nuevas!)
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn'); // Nuevo botón
const errorMessage = document.getElementById('error-message');

// --- Lógica para la página de Login (admin.html) ---
if (loginForm) {
    // Lógica para el formulario de email/contraseña (la mantenemos)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = '/dashboard.html'; })
            .catch(() => { errorMessage.textContent = 'Error: Credenciales incorrectas.'; });
    });

    // --- ¡NUEVA LÓGICA PARA EL BOTÓN DE GOOGLE! ---
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    // Inicio de sesión con Google exitoso, redirige al dashboard
                    window.location.href = '/dashboard.html';
                })
                .catch((error) => {
                    errorMessage.textContent = 'Error al iniciar sesión con Google.';
                    console.error("Error con Google Popup:", error);
                });
        });
    }
}

// --- Lógica para Proteger Rutas y Cerrar Sesión (sin cambios) ---
if (window.location.pathname.includes('/dashboard.html')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/admin.html';
        }
    });

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Cerrar Sesión';
    logoutButton.className = 'button button--secondary';
    logoutButton.style.position = 'fixed';
    logoutButton.style.bottom = '20px';
    logoutButton.style.right = '20px';

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => { window.location.href = '/admin.html'; });
    });

    document.body.appendChild(logoutButton);
}