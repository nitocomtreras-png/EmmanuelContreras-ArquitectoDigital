// assets/js/app-proyectos.js

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-proyectos');

  if (!contenedor || typeof proyectos === 'undefined') {
    console.error('Dependencias no encontradas: contenedor o datos de proyectos.');
    return;
  }

  generarSchemaPrincipal(proyectos); // Pilar de SEO Técnico 

  if (proyectos.length === 0) {
    contenedor.innerHTML = '<p class="text-center">Actualmente no hay proyectos para mostrar. ¡Vuelve pronto!</p>';
    return;
  }

  proyectos.forEach(proyecto => {
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
  // Generación dinámica de HTML limpio y semántico 
  return `
    <article class="portfolio-card" id="${proyecto.id}">
      ${proyecto.imagen ? `
        <img 
          src="${proyecto.imagen}" 
          alt="Visual del proyecto ${proyecto.nombre}" 
          class="portfolio-card__image" 
          loading="lazy"> ` : ''}
      <div class="portfolio-card__content">
        <span class="portfolio-card__tag">${proyecto.tipo}</span>
        <h2 class="portfolio-card__title">${proyecto.nombre}</h2>
        <p class="portfolio-card__description">${proyecto.descripcion}</p>
        
        <div class="portfolio-card__tecnologias mb-6">
          ${proyecto.tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
        
        <div class="mt-auto"> ${proyecto.url_live ? `<a href="${proyecto.url_live}" class="button button--primary">Ver Proyecto</a>` : ''}
          ${proyecto.url_repo ? `<a href="${proyecto.url_repo}" class="button button--secondary mt-2 sm:mt-0 sm:ml-2">Ver Código</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * SEO TÉCNICO AVANZADO: Inyecta el JSON-LD en el <head> de la página.
 * Esto le da a Google un "mapa" de tu contenido para mejores resultados. 
 * @param {Array} proyectos - El array de proyectos.
 */
function generarSchemaPrincipal(proyectos) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Proyectos de Emmanuel Contreras",
    "description": "Portafolio de proyectos de desarrollo web y arquitectura digital de Emmanuel Contreras.",
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
          "url": proyecto.url_live,
          "codeRepository": proyecto.url_repo
        }
      }))
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
