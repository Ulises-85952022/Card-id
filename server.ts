import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 25MB for high-resolution card photos
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // API endpoint to scan and extract contact information from business cards
  app.post("/api/scan-card", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: "No se proporcionó la imagen de la tarjeta de presentación.",
        });
      }

      // Remove data URL prefix if provided (e.g. data:image/png;base64,...)
      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

      const ai = getAiClient();

      if (!ai) {
        return res.status(500).json({
          success: false,
          error: "La clave GEMINI_API_KEY no está configurada en el servidor.",
        });
      }

      const prompt = `Actúa como un asistente experto en digitalización de tarjetas de presentación (business cards).
Analiza detalladamente la imagen de la tarjeta de presentación adjunta y extrae con máxima precisión la información del contacto y de su empresa.
Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta:
{
  "name": "Nombre completo de la persona",
  "title": "Cargo, puesto o título profesional",
  "company": "Nombre de la empresa o grupo corporativo",
  "companyDescription": "Resumen claro de a qué se dedica la empresa, qué productos/servicios ofrece o su lema",
  "division": "División, área o departamento si aparece",
  "email": "Correo electrónico único (solo el principal)",
  "phone": "Teléfono de contacto formateado",
  "whatsapp": "Número de WhatsApp con código de país si está presente (solo dígitos)",
  "website": "Página web o portal URL",
  "location": "Dirección física, ciudad o país",
  "projects": ["Lista de servicios, marcas representadas, proyectos o productos clave indicados en la tarjeta"]
}
Importante: No agregues texto antes ni después del bloque JSON, ni comillas invertidas markdown adicionales si es posible.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanedBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      const rawText = response.text || "";
      // Clean possible markdown code fences
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({
          success: false,
          error: "No se pudo interpretar el formato de los datos de la tarjeta.",
          rawText,
        });
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error("Error al escanear tarjeta con Gemini:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Error al procesar la imagen de la tarjeta.",
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
