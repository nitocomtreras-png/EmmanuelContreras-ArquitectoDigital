// assets/js/app-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const dashboardBody = document.getElementById('dashboard-body');

    if (!dashboardBody || typeof proyectos === 'undefined') {
        console.error('El dashboard o los datos de proyectos no se cargaron correctamente.');
        return;
    }

    if (proyectos.length === 0) {
        dashboardBody.innerHTML = '<tr><td colspan="4">No hay proyectos para mostrar. ¡Añade el primero en data/proyectos.js!</td></tr>';
        return;
    }

    // Ordenamos los proyectos: primero los que no están completados
    const proyectosOrdenados = proyectos.sort((a, b) => {
        if (a.estado === 'Completado' && b.estado !== 'Completado') return 1;
        if (a.estado !== 'Completado' && b.estado === 'Completado') return -1;
        return a.nombre.localeCompare(b.nombre);
    });

    proyectosOrdenados.forEach(proyecto => {
        const fila = crearFilaProyecto(proyecto);
        dashboardBody.innerHTML += fila;
    });
});

/**
 * Crea el HTML para una fila <tr> de la tabla.
 * @param {object} proyecto - El objeto del proyecto.
 * @returns {string} - El string HTML de la fila.
 */
function crearFilaProyecto(proyecto) {
    const estadoSlug = proyecto.estado.toLowerCase().replace(/\s+/g, '-');

    return `
        <tr>
            <td>
                <strong class="text-lg text-gray-900">${proyecto.nombre}</strong>
                <p class="text-sm text-gray-600">${proyecto.descripcion || ''}</p>
            </td>
            <td>
                <span class="status-tag status--${estadoSlug}">${proyecto.estado}</span>
            </td>
            <td>
                <div class="flex flex-wrap gap-1">
                    ${proyecto.tecnologias.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </td>
            <td>
                <div class="flex flex-col gap-2">
                    ${proyecto.url_live ? `<a href="${proyecto.url_live}" target="_blank" class="text-blue-600 hover:underline">Ver Demo</a>` : ''}
                    ${proyecto.url_repo ? `<a href="${proyecto.url_repo}" target="_blank" class="text-blue-600 hover:underline">Ver Repositorio</a>` : ''}
                </div>
            </td>
        </tr>
    `;
}
