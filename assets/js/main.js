document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (id, url) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                // Volver a ejecutar la lógica de la navegación después de cargar el header
                if (id === 'header-placeholder') {
                    initializeNavigation();
                }
            })
            .catch(error => console.error(`Error al cargar ${url}:`, error));
    };

    loadComponent('header-placeholder', '/EmmanuelContreras-ArquitectoDigital/_includes/header.html');
    loadComponent('footer-placeholder', '/EmmanuelContreras-ArquitectoDigital/_includes/footer.html');
});

const initializeNavigation = () => {
    // Lógica del menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Lógica para marcar el enlace activo
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Asegura que 'index.html' sea el default
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
};
