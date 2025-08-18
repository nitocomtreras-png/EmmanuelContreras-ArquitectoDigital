import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const dashboardBody = document.getElementById('dashboard-body');

    if (!dashboardBody) {
        console.error('El cuerpo del dashboard no se encontró.');
        return;
    }

    // Inicializa Firestore
    const db = getFirestore();

    // Crea una consulta para obtener los proyectos y ordenarlos por fecha
    const proyectosRef = collection(db, "proyectos");
    const q = query(proyectosRef, orderBy("fechaCreacion", "desc"));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            dashboardBody.innerHTML = '<tr><td colspan="4">No hay proyectos en la base de datos.</td></tr>';
            return;
        }

        let filasHTML = '';
        querySnapshot.forEach((doc) => {
            // doc.data() es el objeto del proyecto
            const proyecto = doc.data();
            filasHTML += crearFilaProyecto(proyecto);
        });
        dashboardBody.innerHTML = filasHTML;

    } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        dashboardBody.innerHTML = '<tr><td colspan="4">Error al cargar los proyectos.</td></tr>';
    }
});

function crearFilaProyecto(proyecto) {
    const estadoSlug = (proyecto.estado || '').toLowerCase().replace(/\s+/g, '-');
    const tecnologiasHTML = (proyecto.tecnologias || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

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
                <div class="flex flex-wrap gap-1">${tecnologiasHTML}</div>
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