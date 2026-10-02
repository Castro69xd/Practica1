import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));

// Inicialización de Gemini SDK en el servidor con User-Agent recomendado
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Esquema de respuesta estructurada (JSON Schema) para Gemini
const reporteAcervoSchema = {
  type: Type.OBJECT,
  properties: {
    resumenAcervo: {
      type: Type.OBJECT,
      description: 'Resumen consolidado del estado de los libros en la biblioteca de aula.',
      properties: {
        totalLibros: { type: Type.INTEGER, description: 'Cantidad total de libros en el inventario.' },
        librosPrestados: { type: Type.INTEGER, description: 'Cantidad de libros actualmente prestados.' },
        librosAtrasados: { type: Type.INTEGER, description: 'Cantidad de préstamos cuya fecha de devolución venció.' },
        librosDaniados: { type: Type.INTEGER, description: 'Cantidad de libros en estado físico dañado.' },
        recomendaciones: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Recomendaciones prácticas pedagógicas y de cuidado para el docente encargado.',
        },
      },
      required: ['totalLibros', 'librosPrestados', 'librosAtrasados', 'librosDaniados', 'recomendaciones'],
    },
    recordatoriosAtrasos: {
      type: Type.ARRAY,
      description: 'Lista de recordatorios amables y personalizados para cada persona con libros atrasados.',
      items: {
        type: Type.OBJECT,
        properties: {
          persona: { type: Type.STRING, description: 'Nombre de la persona que adeuda el libro.' },
          libroTitulo: { type: Type.STRING, description: 'Título del libro prestado.' },
          libroCodigo: { type: Type.STRING, description: 'Código identificador del libro.' },
          diasAtraso: { type: Type.INTEGER, description: 'Cantidad de días de atraso acumulados.' },
          mensajeAmable: {
            type: Type.STRING,
            description: 'Mensaje empático, motivador y cálido invitando a devolver el libro sin sonar punitivo.',
          },
          tono: {
            type: Type.STRING,
            description: 'Tono utilizado (ejemplo: Cálido, Alentador, Empático).',
          },
        },
        required: ['persona', 'libroTitulo', 'libroCodigo', 'diasAtraso', 'mensajeAmable', 'tono'],
      },
    },
  },
  required: ['resumenAcervo', 'recordatoriosAtrasos'],
};

// Endpoint API para generar recordatorios y reporte
app.post('/api/gemini/reporte', async (req, res) => {
  try {
    const { libros, prestamosAtrasados } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'No se configuró la variable de entorno GEMINI_API_KEY en el servidor.',
        fallbackRequerido: true,
      });
    }

    const prompt = `
Actúa como un bibliotecario y asesor pedagógico escolar cálido y motivador.
Analiza la siguiente información de la biblioteca de aula:
- Total de libros registrados en inventario: ${libros ? libros.length : 0}
- Detalle de libros: ${JSON.stringify(libros || [])}
- Préstamos atrasados actuales: ${JSON.stringify(prestamosAtrasados || [])}

Tareas requeridas:
1. Redacta un recordatorio individual, muy amable, afectuoso y personalizado para cada persona con préstamo atrasado. Destaca la importancia de compartir el libro con sus compañeros de sección, sin ser agresivo ni intimidante.
2. Genera el reporte del acervo con el conteo de libros (totales, prestados, atrasados, dañados) y 2 a 4 recomendaciones constructivas para el encargado del aula.

Devuelve estrictamente el JSON con el esquema solicitado.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un asistente escolar empático que genera recordatorios amables y reportes claros de bibliotecas de aula.',
        responseMimeType: 'application/json',
        responseSchema: reporteAcervoSchema,
        temperature: 0.7,
      },
    });

    const textoRespuesta = response.text;
    if (!textoRespuesta) {
      throw new Error('La respuesta de Gemini vino vacía.');
    }

    const dataJSON = JSON.parse(textoRespuesta);
    return res.json({
      exito: true,
      origen: 'gemini-api',
      datos: dataJSON,
    });
  } catch (error: any) {
    console.error('Error al procesar solicitud con Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Error al comunicarse con Gemini',
      fallbackRequerido: true,
    });
  }
});

// En desarrollo se monta Vite middleware; en producción se sirven archivos estáticos
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor activo en http://0.0.0.0:${PORT}`);
});
