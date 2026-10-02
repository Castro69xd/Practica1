# 📖 Biblioteca de Aula (Anime Edition para Android)

> **Solución ágil y moderna para el aula:** Los libros del aula se prestan y ahora todos vuelven a tiempo.

Una aplicación web móvil ultraligera desarrollada en **HTML5, CSS3 y JavaScript puro**, sin frameworks pesados, sin paso de compilación y optimizada con una estética **Android moderna con diseño Anime chic** (gradientes suaves Sakura & Electric Indigo, tarjetas tipo glassmorphism y navegación inferior flotante tipo pill).

100% compatible con **GitHub Pages** para desplegarse gratis en segundos.

---

## ✨ Funcionalidades Principales

1. **📚 Registro de Libros del Aula**:
   - Registro con código único (ej. `LIB-001`), título, autor y estado (`bueno`, `regular`, `dañado`).
   - Control de inventario en tiempo real con indicador de disponibilidad (`Disponible` / `En préstamo`).
   - Validación para evitar códigos duplicados en el aula.

2. **🤝 Préstamos con Bloqueo de Re-préstamo**:
   - Asignación de libro a una persona con fecha de préstamo y fecha de devolución pactada.
   - **Regla de integridad**: Un libro que ya está prestado **no puede volver a prestarse** a nadie más hasta que se registre su devolución oficial.
   - Botón directo para **Marcar como devuelto** que libera el ejemplar de inmediato.

3. **⚡ Seguimiento de Atrasos (Ordenado por días)**:
   - Detección automática de préstamos no devueltos cuyo plazo de devolución ya expiró.
   - **Ordenamiento descendente**: Los préstamos con más días de atraso aparecen al principio de la lista.
   - Badge visual en el encabezado y en la barra de navegación inferior con el conteo de atrasos.
   - Cálculo de fechas normalizado a UTC medianoche para evitar los errores clásicos de desfase de zona horaria en dispositivos móviles.

---

## 📱 Experiencia en Celulares Android

- **PWA & Web App Ready**: Etiquetas `theme-color`, `mobile-web-app-capable` y diseño adaptable tipo pantalla completa.
- **Instalación en Android**: Abrí el enlace en Chrome para Android, tocá el menú de tres puntos `⋮` y seleccioná **"Agregar a la pantalla principal"**. La app se comportará como una aplicación nativa sin barra de direcciones.
- **Ergonomía táctil**: Targets de toque de mínimo 48px y tipografía de 16px en campos de texto para evitar el molesto auto-zoom en navegadores móviles.

---

## 🚀 Despliegue en GitHub Pages (En 3 pasos)

1. Subí este repositorio a tu cuenta de GitHub (`git push origin main`).
2. En tu repositorio de GitHub, andá a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En la sección **Branch**, seleccioná `main` (o `master`) y la carpeta `/ (root)`, luego hacé clic en **Save**.
4. ¡Listo! En menos de un minuto tu app estará disponible en una URL pública `https://tu-usuario.github.io/tu-repo/`.

---

## 📁 Estructura del Proyecto

```text
├── index.html        # Estructura semántica, vista de pestañas y formularios
├── style.css         # Diseño CSS puro con estética Anime/Android Glassmorphism
├── app.js            # Lógica completa de validación, fechas y persistencia local
├── metadata.json     # Metadatos del applet
└── README.md         # Documentación del proyecto
```

---

## 💾 Persistencia de Datos

Los datos se guardan de forma segura en el `localStorage` del dispositivo del encargado de biblioteca, por lo que permanecen guardados incluso si se recarga la página o se cierra el navegador.
