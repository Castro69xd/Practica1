/**
 * ==============================================================================
 * BIBLIOTECA DE AULA - app.js
 * JavaScript puro (Vanilla JS), sin dependencias ni paso de compilación.
 * Listo para funcionar directamente en el navegador y en GitHub Pages.
 * ==============================================================================
 */

// Claves de almacenamiento para localStorage
const STORAGE_KEYS = {
  LIBROS: 'biblioteca_aula_libros',
  PRESTAMOS: 'biblioteca_aula_prestamos'
};

// ==============================================================================
// 1. MANEJO MODULAR DE ALMACENAMIENTO LOCAL (localStorage)
// ==============================================================================

/**
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE #1:
 * No manejar errores al leer de localStorage. Si el navegador tiene datos
 * corruptos o el usuario navegó en modo incógnito estricto, JSON.parse() lanzará
 * una excepción que congelará toda la aplicación si no se envuelve en try/catch.
 */

// --- Catálogo de Libros ---
function guardarCatalogo(datosLibros) {
  try {
    localStorage.setItem(STORAGE_KEYS.LIBROS, JSON.stringify(datosLibros));
  } catch (error) {
    console.error('Error al guardar el catálogo en localStorage:', error);
    mostrarToast('Error al guardar libros en el dispositivo');
  }
}

function leerCatalogo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBROS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error al leer el catálogo de localStorage:', error);
    return [];
  }
}

function borrarCatalogo() {
  localStorage.removeItem(STORAGE_KEYS.LIBROS);
  libros = [];
}

// --- Préstamos ---
function guardarPrestamos(datosPrestamos) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESTAMOS, JSON.stringify(datosPrestamos));
  } catch (error) {
    console.error('Error al guardar préstamos en localStorage:', error);
    mostrarToast('Error al guardar préstamos en el dispositivo');
  }
}

function leerPrestamos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESTAMOS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error al leer préstamos de localStorage:', error);
    return [];
  }
}

function borrarPrestamos() {
  localStorage.removeItem(STORAGE_KEYS.PRESTAMOS);
  prestamos = [];
}

// --- Borrado global de la app ---
function borrarTodo() {
  borrarCatalogo();
  borrarPrestamos();
}

/**
 * Genera datos de ejemplo: 3 libros y 1 préstamo atrasado (ayer = 1 día de atraso garantizado)
 */
function generarDatosEjemplo() {
  const hoy = new Date();
  
  // Fecha de devolución: ayer (exactamente 1 día de atraso)
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

  // Fecha de préstamo: hace 7 días
  const hace7Dias = new Date();
  hace7Dias.setDate(hoy.getDate() - 7);
  const fechaInicioStr = `${hace7Dias.getFullYear()}-${String(hace7Dias.getMonth() + 1).padStart(2, '0')}-${String(hace7Dias.getDate()).padStart(2, '0')}`;

  const librosEjemplo = [
    {
      id: 'lib_001',
      codigo: 'LIB-001',
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      estado: 'bueno',
      fechaRegistro: new Date().toISOString()
    },
    {
      id: 'lib_002',
      codigo: 'LIB-002',
      titulo: 'El principito',
      autor: 'Antoine de Saint-Exupéry',
      estado: 'regular',
      fechaRegistro: new Date().toISOString()
    },
    {
      id: 'lib_003',
      codigo: 'LIB-003',
      titulo: 'Rayuela',
      autor: 'Julio Cortázar',
      estado: 'bueno',
      fechaRegistro: new Date().toISOString()
    }
  ];

  const prestamosEjemplo = [
    {
      id: 'prestamo_001',
      libroCodigo: 'LIB-001',
      libroTitulo: 'Cien años de soledad',
      libroAutor: 'Gabriel García Márquez',
      persona: 'Ana Gómez',
      fechaPrestamo: fechaInicioStr,
      fechaDevolucion: fechaAyerStr,
      devuelto: false,
      fechaDevolucionReal: null
    }
  ];

  return { librosEjemplo, prestamosEjemplo };
}

// Inicialización de estado en memoria
let libros = leerCatalogo();
let prestamos = leerPrestamos();

// Si es la primera vez que se abre la app (no hay claves en localStorage), inicializar con datos de ejemplo
if (localStorage.getItem(STORAGE_KEYS.LIBROS) === null && localStorage.getItem(STORAGE_KEYS.PRESTAMOS) === null) {
  const { librosEjemplo, prestamosEjemplo } = generarDatosEjemplo();
  libros = librosEjemplo;
  prestamos = prestamosEjemplo;
  guardarCatalogo(libros);
  guardarPrestamos(prestamos);
}

// ==============================================================================
// 2. UTILIDADES DE FECHAS (CÁLCULO EXACTO DE DÍAS Y ATRASOS)
// ==============================================================================

/**
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE #2 (EL MÁS CRÍTICO):
 * En JavaScript, hacer `new Date("2026-10-01")` interpreta la fecha en formato ISO
 * como UTC medianoche (00:00:00 UTC).
 * Si tu dispositivo está en una zona horaria occidental (por ejemplo UTC-3 en Argentina,
 * UTC-5 en Colombia o UTC-7 en México/EE.UU.), las 00:00 UTC corresponden al día anterior
 * a las 19:00 o 21:00 locales.
 *
 * Si comparas eso con `new Date()`, los días se desfasan por 1 día entero.
 *
 * SOLUCIÓN:
 * Descomponer la cadena "YYYY-MM-DD" en año, mes y día explícitos y usar Date.UTC()
 * a las 00:00:00 para ambas fechas (tanto la fecha guardada como el "hoy").
 * De esta manera, el cálculo de días de diferencia es matemáticamente exacto
 * independientemente del huso horario del celular.
 */
function parsearFechaUTC(fechaStr) {
  if (!fechaStr || typeof fechaStr !== 'string') return 0;
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return 0;
  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // En JS los meses van de 0 a 11
  const dia = parseInt(partes[2], 10);
  return Date.UTC(anio, mes, dia);
}

function obtenerHoyUTC() {
  const hoy = new Date();
  return Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

/**
 * Formatea una fecha en formato "YYYY-MM-DD" a partir de un objeto Date local.
 */
function formatearFechaInput(date) {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Formato amigable legible para mostrar en pantalla (DD/MM/YYYY).
 */
function formatearFechaLegible(fechaStr) {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Calcula los días de atraso de un préstamo:
 * Retorna un entero >= 0.
 * Si hoy es mayor que la fecha pactada de devolución, la diferencia son los días de atraso.
 * Si la fecha pactada es hoy o futura, retorna 0 (no atrasado).
 */
function calcularDiasAtraso(fechaDevolucionStr) {
  const msPorDia = 1000 * 60 * 60 * 24; // 86,400,000 milisegundos en un día
  const hoyUTC = obtenerHoyUTC();
  const devolucionUTC = parsearFechaUTC(fechaDevolucionStr);

  const diferenciaMs = hoyUTC - devolucionUTC;
  const dias = Math.floor(diferenciaMs / msPorDia);

  return dias > 0 ? dias : 0;
}

// Sanitización básica para prevenir inyección de HTML
function escaparHTML(texto) {
  if (!texto) return '';
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ==============================================================================
// 3. LÓGICA DE NEGOCIO Y OPERACIONES
// ==============================================================================

/**
 * Verifica si un libro se encuentra actualmente prestado (préstamo activo sin devolver).
 */
function libroEstaPrestado(codigoLibro) {
  return prestamos.some(p => p.libroCodigo === codigoLibro && !p.devuelto);
}

/**
 * FUNCIÓN 1: REGISTRAR UN LIBRO
 * Campos: código, título, autor y estado (bueno, regular, dañado).
 */
function registrarLibro(codigo, titulo, autor, estado) {
  const codigoLimpio = codigo.trim().toUpperCase();
  const tituloLimpio = titulo.trim();
  const autorLimpio = autor.trim();

  // Validaciones en español claro sin tecnicismos
  if (!codigoLimpio) throw new Error('Por favor, escribí el código del libro (por ejemplo: LIB-001).');
  if (!tituloLimpio) throw new Error('Por favor, escribí el título del libro.');
  if (!autorLimpio) throw new Error('Por favor, escribí el autor o autora del libro.');
  if (!['bueno', 'regular', 'dañado'].includes(estado)) {
    throw new Error('Elegí el estado físico del libro: bueno, regular o dañado.');
  }

  const existe = libros.some(l => l.codigo.toUpperCase() === codigoLimpio);
  if (existe) {
    throw new Error(`Ya hay un libro guardado con el código "${codigoLimpio}". Por favor elegí un código distinto.`);
  }

  const nuevoLibro = {
    id: 'lib_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    codigo: codigoLimpio,
    titulo: tituloLimpio,
    autor: autorLimpio,
    estado: estado,
    fechaRegistro: new Date().toISOString()
  };

  libros.push(nuevoLibro);
  guardarCatalogo(libros);
  return nuevoLibro;
}

/**
 * FUNCIÓN 2: PRESTAR UN LIBRO A UNA PERSONA
 * Campos: código de libro, persona, fecha de préstamo y fecha de devolución.
 */
function prestarLibro(codigoLibro, persona, fechaPrestamo, fechaDevolucion) {
  const personaLimpia = persona.trim();

  if (!codigoLibro) throw new Error('Por favor, elegí un libro disponible de la lista.');
  if (!personaLimpia) throw new Error('Por favor, escribí el nombre de la persona que se lleva el libro.');
  if (!fechaPrestamo) throw new Error('Por favor, indicá la fecha en la que se entrega el libro.');
  if (!fechaDevolucion) throw new Error('Por favor, indicá la fecha acordada para la devolución.');

  const libro = libros.find(l => l.codigo === codigoLibro);
  if (!libro) throw new Error('El libro seleccionado no se encuentra en el aula.');

  if (libroEstaPrestado(codigoLibro)) {
    throw new Error(`El libro "${libro.titulo}" (${codigoLibro}) ya está prestado a otra persona. Tenés que esperar a que lo devuelva.`);
  }

  const nuevoPrestamo = {
    id: 'prestamo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    libroCodigo: codigoLibro,
    libroTitulo: libro.titulo,
    libroAutor: libro.autor,
    persona: personaLimpia,
    fechaPrestamo: fechaPrestamo,
    fechaDevolucion: fechaDevolucion,
    devuelto: false,
    fechaDevolucionReal: null
  };

  prestamos.push(nuevoPrestamo);
  guardarPrestamos(prestamos);
  return nuevoPrestamo;
}

/**
 * MARCAR COMO DEVUELTO
 */
function marcarComoDevuelto(prestamoId) {
  const prestamo = prestamos.find(p => p.id === prestamoId);
  if (!prestamo) {
    throw new Error('No se encontró el registro del préstamo.');
  }

  prestamo.devuelto = true;
  prestamo.fechaDevolucionReal = formatearFechaInput(new Date());
  guardarPrestamos(prestamos);
  actualizarTodaLaUI();
  mostrarMensajeExito(`¡Libro devuelto! "${prestamo.libroTitulo}" ya está disponible en el estante.`);
}

/**
 * FUNCIÓN 3: LISTA DE PRÉSTAMOS ATRASADOS
 * Ordenada por días de atraso, del más atrasado al menos.
 */
function obtenerPrestamosAtrasados() {
  /**
   * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE #5:
   * Incluir préstamos que ya fueron devueltos en la lista de atrasados.
   * Solo los préstamos activos (!p.devuelto) con diasAtraso > 0 deben aparecer.
   */
  const activos = prestamos.filter(p => !p.devuelto);

  const conAtraso = activos
    .map(p => {
      const dias = calcularDiasAtraso(p.fechaDevolucion);
      return {
        ...p,
        diasAtraso: dias
      };
    })
    .filter(p => p.diasAtraso > 0);

  /**
   * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE #6:
   * Ordenar con a - b en lugar de b - a.
   * La consigna pide: "del más atrasado al menos", es decir, orden DESCENDENTE.
   */
  conAtraso.sort((a, b) => b.diasAtraso - a.diasAtraso);

  return conAtraso;
}

// ==============================================================================
// 4. RENDERIZADO Y ACTUALIZACIÓN DE LA INTERFAZ (UI)
// ==============================================================================

// Elementos del DOM
const elements = {
  // Pestañas y vistas
  tabs: document.querySelectorAll('.nav-tab'),
  views: document.querySelectorAll('.view-panel'),
  toast: document.getElementById('toast'),

  // Alerta visible en pantalla
  alertBanner: document.getElementById('alertBanner'),
  alertIcon: document.getElementById('alertIcon'),
  alertText: document.getElementById('alertText'),

  // Badges de atraso
  overdueHeaderBadge: document.getElementById('overdueHeaderBadge'),
  overdueCountText: document.getElementById('overdueCountText'),
  tabBadgeAtrasados: document.getElementById('tabBadgeAtrasados'),

  // Vista Atrasados
  atrasadosBanner: document.getElementById('atrasadosBanner'),
  listaAtrasadosContainer: document.getElementById('listaAtrasadosContainer'),

  // Vista Prestar
  formPrestar: document.getElementById('formPrestar'),
  prestamoLibroSelect: document.getElementById('prestamoLibroSelect'),
  prestamoLibroHelp: document.getElementById('prestamoLibroHelp'),
  prestamoPersona: document.getElementById('prestamoPersona'),
  prestamoFechaInicio: document.getElementById('prestamoFechaInicio'),
  prestamoFechaFin: document.getElementById('prestamoFechaFin'),
  btnDevAyer: document.getElementById('btnDevAyer'),
  btnDev7Dias: document.getElementById('btnDev7Dias'),
  btnDev14Dias: document.getElementById('btnDev14Dias'),

  // Vista Libros
  formLibro: document.getElementById('formLibro'),
  libroCodigo: document.getElementById('libroCodigo'),
  libroTitulo: document.getElementById('libroTitulo'),
  libroAutor: document.getElementById('libroAutor'),
  libroEstado: document.getElementById('libroEstado'),
  listaLibrosContainer: document.getElementById('listaLibrosContainer'),
  totalLibrosCount: document.getElementById('totalLibrosCount'),

  // Vista Historial de Préstamos
  listaTodosPrestamosContainer: document.getElementById('listaTodosPrestamosContainer'),

  // Controles de Respaldo y Datos
  btnExportarJSON: document.getElementById('btnExportarJSON'),
  inputImportarJSON: document.getElementById('inputImportarJSON'),
  btnCargarEjemplo: document.getElementById('btnCargarEjemplo'),
  btnBorrarTodo: document.getElementById('btnBorrarTodo')
};

/**
 * Mensajes de Alerta Visibles en Pantalla (sin tecnicismos)
 */
let alertTimeout;
function mostrarMensajeExito(mensaje) {
  if (!elements.alertBanner) return;
  elements.alertBanner.className = 'alert-banner alert-success';
  elements.alertIcon.textContent = '✅';
  elements.alertText.textContent = mensaje;
  elements.alertBanner.classList.remove('hidden');
  clearTimeout(alertTimeout);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alertTimeout = setTimeout(() => {
    elements.alertBanner.classList.add('hidden');
  }, 5000);
}

function mostrarMensajeError(mensaje) {
  if (!elements.alertBanner) return;
  elements.alertBanner.className = 'alert-banner alert-error';
  elements.alertIcon.textContent = '⚠️';
  elements.alertText.textContent = mensaje;
  elements.alertBanner.classList.remove('hidden');
  clearTimeout(alertTimeout);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alertTimeout = setTimeout(() => {
    elements.alertBanner.classList.add('hidden');
  }, 6000);
}

// Compatibilidad
function mostrarToast(mensaje) {
  mostrarMensajeExito(mensaje);
}

/**
 * Cambia la pestaña activa (Mobile Navigation)
 */
function cambiarPestaña(vistaId) {
  elements.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-view') === vistaId);
  });
  elements.views.forEach(view => {
    view.classList.toggle('active', view.id === vistaId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Renderiza la lista de atrasados
 */
function renderizarAtrasados() {
  const atrasados = obtenerPrestamosAtrasados();
  const count = atrasados.length;

  // Actualizar badges
  if (count > 0) {
    elements.overdueHeaderBadge.classList.remove('hidden');
    elements.overdueCountText.textContent = `${count} atrasado${count === 1 ? '' : 's'}`;
    elements.tabBadgeAtrasados.classList.remove('hidden');
    elements.tabBadgeAtrasados.textContent = count;
    elements.atrasadosBanner.classList.remove('hidden');
  } else {
    elements.overdueHeaderBadge.classList.add('hidden');
    elements.tabBadgeAtrasados.classList.add('hidden');
    elements.atrasadosBanner.classList.add('hidden');
  }

  // Renderizar listado
  if (count === 0) {
    elements.listaAtrasadosContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">No hay préstamos atrasados</div>
        <p class="empty-state-desc">Todos los libros prestados están dentro del plazo o ya fueron devueltos al aula.</p>
      </div>
    `;
    return;
  }

  let html = '';
  atrasados.forEach(item => {
    const textoDias = item.diasAtraso === 1 ? '1 día de atraso' : `${item.diasAtraso} días de atraso`;

    html += `
      <article class="item-card is-overdue">
        <div class="item-header">
          <div>
            <h3 class="item-title">${escaparHTML(item.persona)}</h3>
            <div class="item-meta" style="margin-top: 4px;">
              <span>Libro: <strong>${escaparHTML(item.libroTitulo)}</strong></span>
            </div>
          </div>
          <span class="item-badge-danger">${textoDias}</span>
        </div>

        <div class="item-meta">
          <div><span class="code-tag">${escaparHTML(item.libroCodigo)}</span></div>
          <div>Autor: <strong>${escaparHTML(item.libroAutor)}</strong></div>
          <div>Debía devolverse: <strong>${formatearFechaLegible(item.fechaDevolucion)}</strong></div>
        </div>

        <div class="item-actions">
          <button 
            type="button" 
            class="btn btn-action-return" 
            onclick="marcarComoDevuelto('${item.id}')"
          >
            ✓ Marcar como devuelto
          </button>
        </div>
      </article>
    `;
  });

  elements.listaAtrasadosContainer.innerHTML = html;
}

/**
 * Renderiza el selector de libros disponibles en la vista "Prestar"
 */
function renderizarSelectorLibros() {
  const disponibles = libros.filter(l => !libroEstaPrestado(l.codigo));
  const select = elements.prestamoLibroSelect;
  const help = elements.prestamoLibroHelp;

  select.innerHTML = '<option value="" disabled selected>Elegí un libro disponible...</option>';

  if (libros.length === 0) {
    help.innerHTML = `
      <div class="empty-state" style="padding: 16px; margin: 8px 0;">
        <div class="empty-state-title" style="font-size: 16px;">Todavía no hay ningún libro en la biblioteca</div>
        <p class="empty-state-desc" style="font-size: 16px; margin-bottom: 10px;">Para hacer un préstamo, primero tenés que registrar libros en el aula.</p>
        <button type="button" class="btn btn-secondary" onclick="cambiarPestaña('view-libros')">
          Ir a registrar el primer libro
        </button>
      </div>
    `;
    return;
  }

  if (disponibles.length === 0) {
    help.innerHTML = `
      <div style="background-color: var(--error-bg); color: var(--error-text); border: 2px solid var(--error-border); padding: 10px; border-radius: var(--radius-sm); font-weight: 700;">
        Todos los libros registrados están actualmente prestados. Cuando los devuelvan, volverán a aparecer aquí.
      </div>
    `;
    return;
  }

  help.innerHTML = `<span style="font-weight: 700; color: var(--success-text);">Hay ${disponibles.length} libro(s) disponible(s) para préstamo.</span>`;

  disponibles.forEach(libro => {
    const opt = document.createElement('option');
    opt.value = libro.codigo;
    opt.textContent = `[${libro.codigo}] ${libro.titulo} - ${libro.autor}`;
    select.appendChild(opt);
  });
}

/**
 * Renderiza el inventario completo de libros
 */
function renderizarInventarioLibros() {
  elements.totalLibrosCount.textContent = `${libros.length} libro${libros.length === 1 ? '' : 's'}`;

  if (libros.length === 0) {
    elements.listaLibrosContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">📚</div>
        <div class="empty-state-title">Aún no hay ningún libro registrado</div>
        <p class="empty-state-desc">
          El inventario del aula está vacío. ¡Registrá el primer libro usando el formulario de arriba para empezar a prestárselo a tus estudiantes!
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  const copiaInvertida = [...libros].reverse();

  copiaInvertida.forEach(l => {
    const prestado = libroEstaPrestado(l.codigo);
    const estadoPrestamo = prestado 
      ? '<span style="color: var(--error-border); font-weight: 800;">En préstamo</span>' 
      : '<span style="color: var(--success-border); font-weight: 800;">Disponible</span>';

    html += `
      <article class="item-card">
        <div class="item-header">
          <div>
            <span class="code-tag">${escaparHTML(l.codigo)}</span>
            <h4 class="item-title" style="margin-top: 6px;">${escaparHTML(l.titulo)}</h4>
          </div>
          <span class="status-badge status-${escaparHTML(l.estado)}">Estado: ${escaparHTML(l.estado)}</span>
        </div>

        <div class="item-meta">
          <div>Autor: <strong>${escaparHTML(l.autor)}</strong></div>
          <div>Situación: ${estadoPrestamo}</div>
        </div>
      </article>
    `;
  });

  elements.listaLibrosContainer.innerHTML = html;
}

/**
 * Renderiza el historial de préstamos (activos y devueltos)
 */
function renderizarHistorialPrestamos() {
  if (prestamos.length === 0) {
    elements.listaTodosPrestamosContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No hay préstamos registrados</div>
        <p class="empty-state-desc">Los préstamos que confirmes aparecerán listados aquí.</p>
      </div>
    `;
    return;
  }

  let html = '';
  // Préstamos más recientes primero
  const prestamosOrdenados = [...prestamos].reverse();

  prestamosOrdenados.forEach(p => {
    const atraso = !p.devuelto ? calcularDiasAtraso(p.fechaDevolucion) : 0;
    const esAtrasado = atraso > 0;

    let badgeEstado = '';
    if (p.devuelto) {
      badgeEstado = '<span class="status-badge status-bueno">Devuelto</span>';
    } else if (esAtrasado) {
      badgeEstado = `<span class="item-badge-danger">${atraso}d atraso</span>`;
    } else {
      badgeEstado = '<span class="status-badge status-regular">En curso</span>';
    }

    html += `
      <article class="item-card ${esAtrasado ? 'is-overdue' : ''}">
        <div class="item-header">
          <div>
            <h4 class="item-title">${escaparHTML(p.persona)}</h4>
            <div class="item-meta" style="margin-top: 2px;">
              <span>Libro: <strong>${escaparHTML(p.libroTitulo)}</strong></span>
            </div>
          </div>
          <div>${badgeEstado}</div>
        </div>

        <div class="item-meta">
          <span class="code-tag">${escaparHTML(p.libroCodigo)}</span>
          <span class="item-meta-separator">·</span>
          <span>Prestado: ${formatearFechaLegible(p.fechaPrestamo)}</span>
          <span class="item-meta-separator">·</span>
          <span>Pactado: ${formatearFechaLegible(p.fechaDevolucion)}</span>
          ${p.fechaDevolucionReal ? `<span class="item-meta-separator">·</span><span>Devuelto el: ${formatearFechaLegible(p.fechaDevolucionReal)}</span>` : ''}
        </div>

        ${!p.devuelto ? `
          <div class="item-actions">
            <button 
              type="button" 
              class="btn btn-success" 
              onclick="marcarComoDevuelto('${p.id}')"
            >
              ✓ Marcar como devuelto
            </button>
          </div>
        ` : ''}
      </article>
    `;
  });

  elements.listaTodosPrestamosContainer.innerHTML = html;
}

/**
 * Actualiza toda la interfaz de forma sincronizada
 */
function actualizarTodaLaUI() {
  renderizarAtrasados();
  renderizarSelectorLibros();
  renderizarInventarioLibros();
  renderizarHistorialPrestamos();
}

// ==============================================================================
// 5. INICIALIZACIÓN DE FECHAS PREDETERMINADAS Y EVENTOS
// ==============================================================================

function configurarFechasPorDefecto() {
  const hoy = new Date();
  const hoyStr = formatearFechaInput(hoy);

  // Fecha de préstamo hoy
  if (elements.prestamoFechaInicio) {
    elements.prestamoFechaInicio.value = hoyStr;
  }

  // Fecha de devolución en 7 días por defecto
  const en7Dias = new Date();
  en7Dias.setDate(hoy.getDate() + 7);
  if (elements.prestamoFechaFin) {
    elements.prestamoFechaFin.value = formatearFechaInput(en7Dias);
  }
}

// Botones de atajo rápido de fechas
if (elements.btnDevAyer) {
  elements.btnDevAyer.addEventListener('click', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    elements.prestamoFechaFin.value = formatearFechaInput(ayer);
    mostrarToast('Fecha fijada a: Ayer');
  });
}

if (elements.btnDev7Dias) {
  elements.btnDev7Dias.addEventListener('click', () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    elements.prestamoFechaFin.value = formatearFechaInput(d);
    mostrarToast('Fecha fijada a: +7 días');
  });
}

if (elements.btnDev14Dias) {
  elements.btnDev14Dias.addEventListener('click', () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    elements.prestamoFechaFin.value = formatearFechaInput(d);
    mostrarToast('Fecha fijada a: +14 días');
  });
}

// Navegación por pestañas (táctil para celulares)
elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-view');
    cambiarPestaña(target);
  });
});

// Evento: Registrar Libro
if (elements.formLibro) {
  elements.formLibro.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const codigo = elements.libroCodigo.value;
      const titulo = elements.libroTitulo.value;
      const autor = elements.libroAutor.value;
      const estado = elements.libroEstado.value;

      registrarLibro(codigo, titulo, autor, estado);

      // Limpiar formulario y notificar
      elements.formLibro.reset();
      actualizarTodaLaUI();
      mostrarMensajeExito(`¡Listo! El libro "${titulo}" (${codigo.toUpperCase()}) fue guardado en el aula.`);
    } catch (err) {
      mostrarMensajeError(err.message);
    }
  });
}

// Evento: Prestar Libro
if (elements.formPrestar) {
  elements.formPrestar.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const codigoLibro = elements.prestamoLibroSelect.value;
      const persona = elements.prestamoPersona.value;
      const fechaPrestamo = elements.prestamoFechaInicio.value;
      const fechaDevolucion = elements.prestamoFechaFin.value;

      prestarLibro(codigoLibro, persona, fechaPrestamo, fechaDevolucion);

      // Limpiar formulario de préstamo
      elements.prestamoPersona.value = '';
      configurarFechasPorDefecto();
      actualizarTodaLaUI();

      mostrarMensajeExito(`¡Préstamo registrado! "${codigoLibro}" entregado a ${persona}.`);

      // Si la fecha de devolución ya venció, cambiar a atrasados
      if (calcularDiasAtraso(fechaDevolucion) > 0) {
        cambiarPestaña('view-atrasados');
      } else {
        cambiarPestaña('view-prestamos');
      }
    } catch (err) {
      mostrarMensajeError(err.message);
    }
  });
}

// ==============================================================================
// 6. FUNCIONES DE EXPORTACIÓN, IMPORTACIÓN Y RESPALDO
// ==============================================================================

/**
 * Descarga una copia de seguridad en formato JSON
 */
function exportarDatosJSON() {
  try {
    const payload = {
      app: 'Biblioteca de Aula',
      version: '1.0',
      fechaExportacion: new Date().toISOString(),
      libros: libros,
      prestamos: prestamos
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `copia_biblioteca_aula_${formatearFechaInput(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    mostrarMensajeExito('¡Copia de seguridad descargada en tu dispositivo!');
  } catch (error) {
    console.error('Error al exportar JSON:', error);
    mostrarMensajeError('No se pudo generar el archivo de copia de seguridad.');
  }
}

/**
 * Importa y restaura una copia de seguridad desde un archivo JSON
 */
function importarDatosJSON(archivo) {
  if (!archivo) return;
  const lector = new FileReader();

  lector.onload = (e) => {
    try {
      const contenido = JSON.parse(e.target.result);
      if (!Array.isArray(contenido.libros) || !Array.isArray(contenido.prestamos)) {
        throw new Error('El archivo seleccionado no corresponde a una copia válida de la biblioteca.');
      }

      libros = contenido.libros;
      prestamos = contenido.prestamos;

      guardarCatalogo(libros);
      guardarPrestamos(prestamos);

      actualizarTodaLaUI();
      mostrarMensajeExito(`¡Datos recuperados! Se restauraron ${libros.length} libros y ${prestamos.length} préstamos.`);
    } catch (err) {
      console.error('Error al leer el archivo:', err);
      mostrarMensajeError('No se pudo leer el archivo. Verificá que sea un archivo de respaldo válido.');
    }
  };

  lector.readAsText(archivo);
}

// Eventos de Respaldo
if (elements.btnExportarJSON) {
  elements.btnExportarJSON.addEventListener('click', exportarDatosJSON);
}

if (elements.inputImportarJSON) {
  elements.inputImportarJSON.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importarDatosJSON(file);
      e.target.value = '';
    }
  });
}

if (elements.btnCargarEjemplo) {
  elements.btnCargarEjemplo.addEventListener('click', () => {
    if (confirm('¿Querés cargar los 3 libros y el préstamo de ejemplo?')) {
      const { librosEjemplo, prestamosEjemplo } = generarDatosEjemplo();
      libros = librosEjemplo;
      prestamos = prestamosEjemplo;
      guardarCatalogo(libros);
      guardarPrestamos(prestamos);
      actualizarTodaLaUI();
      mostrarMensajeExito('Se cargaron los 3 libros y el préstamo de prueba.');
    }
  });
}

if (elements.btnBorrarTodo) {
  elements.btnBorrarTodo.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que querés borrar todos los libros y préstamos del aula? Esta acción no se puede deshacer.')) {
      borrarTodo();
      actualizarTodaLaUI();
      mostrarMensajeExito('Se borraron todos los libros y préstamos del aula.');
    }
  });
}

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  configurarFechasPorDefecto();
  actualizarTodaLaUI();
});
