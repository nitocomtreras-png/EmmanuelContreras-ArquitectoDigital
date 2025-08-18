import { getFirestore, collection, getDocs, orderBy, query, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();
const dashboardBody = document.getElementById('dashboard-body');
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const projectForm = document.getElementById('project-form');
const addProjectBtn = document.getElementById('add-project-btn');
const cancelBtn = document.getElementById('cancel-btn');

// --- FUNCIÓN PRINCIPAL PARA CARGAR PROYECTOS ---
async function cargarProyectos() {
    if (!dashboardBody) return;

    const proyectosRef = collection(db, "proyectos");
    const q = query(proyectosRef, orderBy("fechaCreacion", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        dashboardBody.innerHTML = ''; // Limpia la tabla antes de cargar
        if (querySnapshot.empty) {
            dashboardBody.innerHTML = '<tr><td colspan="5">No hay proyectos. ¡Añade el primero!</td></tr>';
            return;
        }
        querySnapshot.forEach((doc) => {
            const proyecto = { id: doc.id, ...doc.data() };
            dashboardBody.innerHTML += crearFilaProyecto(proyecto);
        });
    } catch (error) {
        console.error("Error al obtener los proyectos:", error);
    }
}

// --- FUNCIÓN PARA CREAR LAS FILAS DE LA TABLA (CON BOTONES DE ACCIÓN) ---
function crearFilaProyecto(proyecto) {
    const estadoSlug = (proyecto.estado || '').toLowerCase().replace(/\s+/g, '-');
    const tecnologiasHTML = (proyecto.tecnologias || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

    return `
        <tr data-id="${proyecto.id}">
            <td>
                <strong class="text-lg text-gray-900">${proyecto.nombre}</strong>
                <p class="text-sm text-gray-600">${proyecto.descripcion || ''}</p>
            </td>
            <td><span class="status-tag status--${estadoSlug}">${proyecto.estado}</span></td>
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

// --- LÓGICA DEL MODAL ---
addProjectBtn.addEventListener('click', () => {
    projectForm.reset();
    document.getElementById('project-id').value = '';
    modalTitle.textContent = 'Añadir Nuevo Proyecto';
    modal.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// --- LÓGICA PARA GUARDAR (CREAR O ACTUALIZAR) ---
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('project-id').value;
    const proyecto = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        tecnologias: document.getElementById('tecnologias').value.split(',').map(t => t.trim()),
        url_live: document.getElementById('url_live').value,
        url_repo: document.getElementById('url_repo').value,
        imagen: document.getElementById('imagen').value,
        estado: document.getElementById('estado').value,
    };

    if (id) { // Si hay un ID, actualizamos el documento existente
        const docRef = doc(db, "proyectos", id);
        await updateDoc(docRef, proyecto);
    } else { // Si no hay ID, creamos un nuevo documento
        proyecto.fechaCreacion = serverTimestamp(); // Añade la fecha de creación
        await addDoc(collection(db, "proyectos"), proyecto);
    }

    modal.classList.add('hidden');
    cargarProyectos(); // Recargamos la tabla para ver los cambios
});

// --- LÓGICA PARA EDITAR Y ELIMINAR (ESCUCHANDO CLICS EN LA TABLA) ---
dashboardBody.addEventListener('click', async (e) => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    const id = row.dataset.id;

    // Si se hace clic en el botón de Editar
    if (target.classList.contains('edit-btn')) {
        const docRef = doc(db, "proyectos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('project-id').value = id;
            document.getElementById('nombre').value = data.nombre;
            document.getElementById('descripcion').value = data.descripcion;
            document.getElementById('tecnologias').value = (data.tecnologias || []).join(', ');
            document.getElementById('url_live').value = data.url_live || '';
            document.getElementById('url_repo').value = data.url_repo || '';
            document.getElementById('imagen').value = data.imagen || '';
            document.getElementById('estado').value = data.estado;

            modalTitle.textContent = 'Editar Proyecto';
            modal.classList.remove('hidden');
        }
    }

    // Si se hace clic en el botón de Eliminar
    if (target.classList.contains('delete-btn')) {
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.')) {
            await deleteDoc(doc(db, "proyectos", id));
            cargarProyectos();
        }
    }
});


// --- CARGA INICIAL DE DATOS ---
document.addEventListener('DOMContentLoaded', cargarProyectos);