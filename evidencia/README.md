# 📁 Evidencia de Desarrollo - Biblioteca de Aula

Este directorio reúne las capturas de pantalla y la documentación del proceso iterativo de desarrollo de la aplicación **Biblioteca de Aula**, desde la especificación inicial hasta la integración con la API de Gemini y la auditoría de calidad.

---

## 📸 Registro de Capturas

| Archivo | Hito / Fase | Descripción |
| :--- | :--- | :--- |
| **`practicacap1.png`** | **Fase 1: Versión Funcional Inicial** | Registro de libros (`LIB-001`), préstamos a personas, marcado de devolución y lista de atrasos en HTML/CSS/JS puro sin frameworks. |
| **`practicacap2.png`** | **Fase 2: Interfaz Móvil y Documentación** | Estilo visual Android moderno con diseño Anime chic, navegación inferior tipo pill y generación del `README.md`. |
| **`practicacap3.png`** | **Fase 3: Persistencia y Respaldos** | Almacenamiento local mediante `localStorage`, exportación/importación JSON y precarga de 3 libros y 1 préstamo atrasado. |
| **`practicacap4.png`** | **Fase 4: Accesibilidad y Alto Contraste** | Optimización para pantallas de 320 px, textos $\ge 16\text{px}$, contraste apto para luz solar y jerarquía de un solo botón principal por pantalla. |
| **`practicacap5.png`** | **Fase 5: Auditoría de QA y Pruebas Destructivas** | Blindaje contra 10 escenarios extremos (campos con espacios, fechas paradójicas, desbordes de 500 caracteres, doble clic, etc.). |
| **`practicacap6.png`** | **Fase 6: Integración con Gemini API** | Reporte mensual del acervo en tabla, redacción de recordatorios amables estructurados con `responseSchema`, datos de prueba (mock) y fallback seguro. |

---

## 🔍 Detalle de Cada Hito

### 1. `practicacap1.png` - Primera Versión Funcional
* **Objetivo:** Resolver el problema crítico de libros prestados que no regresan.
* **Funciones:**
  1. Registrar libro con código, título, autor y estado (`bueno`, `regular`, `dañado`).
  2. Prestar libro a una persona con fecha pactada y botón de devolución.
  3. Lista de atrasados ordenada por días de atraso de mayor a menor.

### 2. `practicacap2.png` - Estética Android Anime Moderno
* **Objetivo:** Experiencia atractiva y táctil en teléfonos móviles.
* **Detalles:** Gradientes sutiles Sakura y Electric Indigo, tarjetas tipo glassmorphism y barra de navegación flotante.

### 3. `practicacap3.png` - Persistencia de Datos
* **Objetivo:** Evitar la pérdida de datos al cerrar el navegador.
* **Detalles:** Implementación modular de `localStorage`, herramientas de descarga de respaldo JSON y precarga de datos de prueba (`LIB-001` prestado a Ana con 1 día de atraso).

### 4. `practicacap4.png` - Accesibilidad y Ergonomía
* **Objetivo:** Legibilidad en exteriores bajo el sol y uso con una sola mano.
* **Detalles:** Ancho fluido desde 320 px, tipografía estricta de al menos 16 px en toda la interfaz, etiquetas visibles y un único botón principal por pantalla.

### 5. `practicacap5.png` - Control de Calidad (QA)
* **Objetivo:** Evitar quiebres o comportamientos inesperados desde la interfaz.
* **Detalles:** Prevención de fechas de devolución anteriores a la de préstamo, bloqueo de doble clic, sanitización de entradas y sincronización entre pestañas.

### 6. `practicacap6.png` - Inteligencia Artificial con Gemini
* **Objetivo:** Generación de valor pedagógico y empatía en la cobranza de libros.
* **Detalles:** Salida estructurada JSON (`responseSchema`), tabla de resumen del acervo, mensajes personalizados copiables al portapapeles y modo seguro con plantilla automática ante fallos de conexión.
