// assets/js/app-proyectos-publicos.js

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-proyectos-publicos');

  if (!contenedor || typeof proyectos === 'undefined') {
    console.error('Dependencias no encontradas: contenedor o datos de proyectos.');
    return;
  }

  // --- ¡LA MAGIA OCURRE AQUÍ! ---
  // Filtramos el array para obtener solo los proyectos marcados como "Completado"
  const proyectosCompletados = proyectos.filter(proyecto => proyecto.estado === 'Completado');
  
  generarSchemaPrincipal(proyectosCompletados); // SEO Técnico sobre los proyectos públicos 

  if (proyectosCompletados.length === 0) {
    contenedor.innerHTML = '<p class="text-center">Aún no hay casos de éxito públicos. ¡Pronto habrá nuevos proyectos completados!</p>';
    return;
  }

  // Iteramos sobre el array ya filtrado para crear las tarjetas
  proyectosCompletados.forEach(proyecto => {
    const tarjetaHTML = crearTarjetaProyecto(proyecto);
    contenedor.innerHTML += tarjetaHTML;
  });
});

/**
 * Crea el HTML para una tarjeta de proyecto individual.
 * @param {object} proyecto - El objeto del proyecto.
 * @returns {string} - El string HTML de la tarjeta.
 */
function crearTarjetaProyecto(proyecto) {
  // Esta función no necesita cambios, es la misma que ya teníamos
  return `
    <article class="portfolio-card" id="${proyecto.id}">
        <img src="${proyecto.imagen}" alt="Visual del proyecto ${proyecto.nombre}" class="portfolio-card__image" loading="lazy">
        <div class="portfolio-card__content">
            <span class="portfolio-card__tag">${proyecto.tipo}</span>
            <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
            <p class="portfolio-card__description">${proyecto.descripcion}</p>
            <div class="portfolio-card__tecnologias mb-6">
                ${proyecto.tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
            </div>
            <div class="mt-auto">
                <a href="${proyecto.url_live}" class="button button--primary">Ver Detalles del Caso</a>
            </div>
        </div>
    </article>
  `;
}

/**
 * Inyecta el JSON-LD en el <head> para SEO avanzado.
 * @param {Array} proyectos - El array de proyectos a incluir en el schema.
 */
function generarSchemaPrincipal(proyectos) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Casos de Éxito de Emmanuel Contreras",
    "description": "Portafolio de proyectos completados por Emmanuel Contreras, Arquitecto Digital.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": proyectos.map((proyecto, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": proyecto.nombre,
          "description": proyecto.descripcion,
          "image": proyecto.imagen,
          "url": proyecto.url_live
        }
      }))
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
