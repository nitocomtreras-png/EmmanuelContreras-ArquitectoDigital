import { getFirestore, collection, getDocs, orderBy, query, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN Y REFERENCIAS AL DOM ---
    const db = getFirestore();
    const dashboardBody = document.getElementById('dashboard-body');
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const projectForm = document.getElementById('project-form');
    const addProjectBtn = document.getElementById('add-project-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const searchInput = document.getElementById('search-input');
    const statsContainer = document.getElementById('stats-container');
    const calendarioContainer = document.getElementById('calendario');

    let todosLosProyectos = []; // Caché local de proyectos para búsquedas rápidas
    let calendario = null; // Instancia del calendario

    // --- FUNCIÓN PARA RENDERIZAR LA TABLA DE PROYECTOS ---
    function renderizarTabla(proyectos) {
        dashboardBody.innerHTML = '';
        if (proyectos.length === 0) {
            dashboardBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron proyectos.</td></tr>';
            return;
        }
        proyectos.forEach(proyecto => {
            dashboardBody.innerHTML += crearFilaProyecto(proyecto);
        });
    }

    // --- FUNCIÓN PARA ACTUALIZAR LAS ESTADÍSTICAS ---
    function actualizarEstadisticas(proyectos) {
        const conteo = {
            total: proyectos.length,
            completado: proyectos.filter(p => p.estado === 'Completado').length,
            enDesarrollo: proyectos.filter(p => p.estado === 'En Desarrollo').length,
            propuesta: proyectos.filter(p => p.estado === 'Propuesta').length,
        };

        statsContainer.innerHTML = `
            <div class="stat-card">
                <span class="stat-card__number">${conteo.total}</span>
                <span class="stat-card__label">Total</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__number">${conteo.completado}</span>
                <span class="stat-card__label">Completados</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__number">${conteo.enDesarrollo}</span>
                <span class="stat-card__label">En Desarrollo</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__number">${conteo.propuesta}</span>
                <span class="stat-card__label">Propuestas</span>
            </div>
        `;
    }

    // --- FUNCIÓN PARA INICIALIZAR Y ACTUALIZAR EL CALENDARIO ---
    function inicializarCalendario(proyectos) {
        if (!calendarioContainer) return;

        const eventos = proyectos
            .filter(p => p.fechaEntrega) // Solo proyectos con fecha
            .map(p => ({
                start: p.fechaEntrega,
                title: p.nombre,
            }));

        const options = { events: eventos };

        if (calendario) calendario.destroy(); // Limpia el calendario anterior

        calendario = new VanillaJsCalendar(calendarioContainer, options);
        calendario.init();
    }

    // --- FUNCIÓN PRINCIPAL PARA CARGAR TODOS LOS DATOS DESDE FIRESTORE ---
    async function cargarProyectos() {
        if (!dashboardBody) return;

        const proyectosRef = collection(db, "proyectos");
        const q = query(proyectosRef, orderBy("fechaCreacion", "desc"));

        try {
            const querySnapshot = await getDocs(q);
            todosLosProyectos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Renderiza todos los componentes con los datos frescos
            renderizarTabla(todosLosProyectos);
            actualizarEstadisticas(todosLosProyectos);
            inicializarCalendario(todosLosProyectos);

        } catch (error) {
            console.error("Error al obtener los proyectos:", error);
            dashboardBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error al cargar los proyectos.</td></tr>';
        }
    }

    // --- FUNCIÓN PARA CREAR UNA FILA DE LA TABLA (INCLUYE MINIATURA) ---
    function crearFilaProyecto(proyecto) {
        const estadoSlug = (proyecto.estado || 'desconocido').toLowerCase().replace(/\s+/g, '-');
        const tecnologiasHTML = (proyecto.tecnologias || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');
        const imagenHTML = proyecto.imagen ? `<img src="${proyecto.imagen}" alt="Miniatura" class="dashboard-thumbnail">` : '<div class="dashboard-thumbnail" style="background-color:#f0f0f0;"></div>';

        return `
            <tr data-id="${proyecto.id}">
                <td>
                    <div style="display: flex; align-items: center;">
                        ${imagenHTML}
                        <div>
                            <strong class="text-lg text-gray-900">${proyecto.nombre}</strong>
                            <p class="text-sm text-gray-600">${proyecto.descripcion || 'Sin descripción.'}</p>
                        </div>
                    </div>
                </td>
                <td><span class="status-tag status--${estadoSlug}">${proyecto.estado || 'N/A'}</span></td>
                <td><div class="flex flex-wrap gap-1">${tecnologiasHTML}</div></td>
                <td>
                    <div class="flex flex-col gap-2">
                        ${proyecto.url_live ? `<a href="${proyecto.url_live}" target="_blank" class="text-blue-600 hover:underline">Ver Demo</a>` : ''}
                        ${proyecto.url_repo ? `<a href="${proyecto.url_repo}" target="_blank" class="text-blue-600 hover:underline">Ver Repositorio</a>` : ''}
                    </div>
                </td>
                <td class="w-24">
                    <div class="flex gap-2">
                        <button class="edit-btn text-blue-500 hover:text-blue-700">Editar</button>
                        <button class="delete-btn text-red-500 hover:text-red-700">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // --- MANEJADORES DE EVENTOS ---

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        const proyectosFiltrados = todosLosProyectos.filter(p =>
            p.nombre.toLowerCase().includes(termino) ||
            (p.descripcion || '').toLowerCase().includes(termino)
        );
        renderizarTabla(proyectosFiltrados);
    });

    // Abrir y cerrar modal
    addProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        document.getElementById('project-id').value = '';
        modalTitle.textContent = 'Añadir Nuevo Proyecto';
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Guardar (Crear o Actualizar) proyecto
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const proyecto = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            tecnologias: document.getElementById('tecnologias').value.split(',').map(t => t.trim()).filter(t => t),
            url_live: document.getElementById('url_live').value,
            url_repo: document.getElementById('url_repo').value,
            imagen: document.getElementById('imagen').value,
            estado: document.getElementById('estado').value,
            fechaEntrega: document.getElementById('fechaEntrega').value,
        };
        if (!proyecto.fechaEntrega) delete proyecto.fechaEntrega;

        try {
            if (id) {
                await updateDoc(doc(db, "proyectos", id), proyecto);
            } else {
                proyecto.fechaCreacion = serverTimestamp();
                await addDoc(collection(db, "proyectos"), proyecto);
            }
            modal.classList.add('hidden');
            cargarProyectos();
        } catch (error) {
            console.error("Error al guardar el proyecto:", error);
            alert("Hubo un error al guardar el proyecto.");
        }
    });

    // Editar y Eliminar (usando delegación de eventos)
    dashboardBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !row.dataset.id) return;
        const id = row.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const docSnap = await getDoc(doc(db, "proyectos", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('project-id').value = id;
                document.getElementById('nombre').value = data.nombre || '';
                document.getElementById('descripcion').value = data.descripcion || '';
                document.getElementById('tecnologias').value = (data.tecnologias || []).join(', ');
                document.getElementById('url_live').value = data.url_live || '';
                document.getElementById('url_repo').value = data.url_repo || '';
                document.getElementById('imagen').value = data.imagen || '';
                document.getElementById('estado').value = data.estado || 'Propuesta';
                document.getElementById('fechaEntrega').value = data.fechaEntrega || '';
                modalTitle.textContent = 'Editar Proyecto';
                modal.classList.remove('hidden');
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.')) {
                try {
                    await deleteDoc(doc(db, "proyectos", id));
                    cargarProyectos();
                } catch (error) {
                    console.error("Error al eliminar el proyecto:", error);
                    alert("Hubo un error al eliminar el proyecto.");
                }
            }
        }
    });

    // --- CARGA INICIAL DE DATOS AL INICIAR LA PÁGINA ---
    cargarProyectos();
});