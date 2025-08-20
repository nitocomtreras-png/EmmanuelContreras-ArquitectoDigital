// assets/js/app-proyectos-publicos.js

// Importamos las funciones necesarias de Firestore para "hablar" con la base de datos.
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Buscamos el contenedor en tu HTML donde pondremos los proyectos.
    const contenedor = document.getElementById('contenedor-proyectos-publicos');

    if (!contenedor) {
        console.error('El contenedor de proyectos públicos no se encontró.');
        return;
    }

    // Inicializamos la conexión a la base de datos.
    const db = getFirestore();

    // Aquí está la magia: creamos una consulta específica para Firestore.
    const proyectosRef = collection(db, "proyectos");
    const q = query(proyectosRef,
        where("estado", "==", "Completado"), // Solo trae proyectos con estado "Completado".
        orderBy("fechaCreacion", "desc")     // Ordena los resultados del más nuevo al más viejo.
    );

    try {
        const querySnapshot = await getDocs(q); // Ejecutamos la consulta.

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p class="text-center">Aún no hay casos de éxito públicos. ¡Pronto habrá nuevos proyectos completados!</p>';
            return;
        }

        let tarjetasHTML = '';
        querySnapshot.forEach((doc) => {
            const proyecto = doc.data();
            tarjetasHTML += crearTarjetaProyecto(proyecto); // Creamos el HTML para cada proyecto.
        });
        contenedor.innerHTML = tarjetasHTML; // Insertamos todo el HTML en la página.

    } catch (error) {
        console.error("Error al obtener los casos de éxito:", error);
        contenedor.innerHTML = '<p class="text-center">Hubo un error al cargar los proyectos. Intenta de nuevo más tarde.</p>';
    }
});

// Esta función simplemente crea el bloque de HTML para una tarjeta de proyecto.
function crearTarjetaProyecto(proyecto) {
    return `
      <article class="portfolio-card">
          <img src="${proyecto.imagen}" alt="Visual del proyecto ${proyecto.nombre}" class="portfolio-card__image" loading="lazy">
          <div class="portfolio-card__content">
              <span class="portfolio-card__tag">${proyecto.tipo || 'Caso de Éxito'}</span>
              <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
              <p class="portfolio-card__description">${proyecto.descripcion}</p>
              <div class="portfolio-card__tecnologias mb-6">
                  ${(proyecto.tecnologias || []).map(tech => `<span class="tag">${tech}</span>`).join('')}
              </div>
              <div class="mt-auto">
                  <a href="${proyecto.url_live}" class="button button--primary">Ver Detalles del Caso</a>
              </div>
          </div>
      </article>
    `;
}