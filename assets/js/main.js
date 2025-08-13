document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (id, url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la red: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(id).innerHTML = data;
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
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkPath = linkHref.split('/').pop();
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        }
    });
};
