import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "API Key not configured" });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // We use generateContent instead of chat to easily pass history
      const contents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      let response;
      let retries = 3;
      let lastError;
      let currentModel = "gemini-2.5-flash";

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: currentModel,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
            }
          });
          break;
        } catch (error: any) {
          lastError = error;
          if (error.status === "UNAVAILABLE" || error.status === 503 || error.status === 429) {
            retries--;
            if (retries > 0) {
              // Try falling back to flash-8b if standard flash is busy
              if (currentModel === "gemini-2.5-flash") {
                currentModel = "gemini-1.5-flash-8b";
              }
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }
          }
          throw error;
        }
      }

      if (!response) {
        throw lastError;
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error from Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
