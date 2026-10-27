import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  authenticate,
  getHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  getRegisteredTrainees,
  saveAudioFile,
  getAudioFile,
  initDatabase,
  getDatabaseStatus,
  updateUserPassword,
  getAllUsers,
  createUser,
  deleteUser,
  getAllUsersWithStats,
  toggleUserBlock
} from "./server/db";

dotenv.config();

async function startServer() {
  await initDatabase();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/status", async (req, res) => {
    try {
      const dbStatus = await getDatabaseStatus();
      res.json({
        status: "ok",
        service: "JYC Equipment Sales Trainer",
        timestamp: new Date().toISOString(),
        database: dbStatus
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", error: err.message });
    }
  });

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

      const fallbackModels = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
      let response;
      let lastError;

      for (const modelName of fallbackModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (error: any) {
          console.warn(`Model ${modelName} chat attempt failed:`, error.message);
          lastError = error;
          await new Promise(r => setTimeout(r, 800));
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

  app.post("/api/audit-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;

      if (!audioBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing audio data or mime type" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            },
            {
              text: `Please listen to and evaluate this sales call audio recording. The representative (Trainee) from JYC Equipment / JYC Medical is speaking with an industrial decision-maker (Prospect) regarding heavy machinery or medical imaging systems (buying surplus equipment from the company, offering/selling machinery to the company, or both).

First, transcribe the entire call dialogue accurately as a list of spoken lines, separating the "Trainee" and the "Prospect", and include it in the "transcript" property of the output JSON.
Listen to the audio to determine the language spoken, but write all critique details (summary, strengths, weaknesses, objectionsHandled feedback, recommendations) in Spanish, backing every point with concrete examples from the conversation.
Do NOT award a high score simply because the prospect showed interest; evaluate the real commercial skill demonstrated by the salesperson.

Evaluate the following 10 observable commercial criteria (checklist):
- openingAndPresentation: 1. Apertura y presentación profesional (bypass de recepción e identificación clara).
- attentionGrabbing: 2. Capacidad para captar la atención del tomador de decisiones.
- needsIdentification: 3. Identificación de necesidades operativas, de flota o de desincorporación de equipos.
- activeListeningAndQuestions: 4. Escucha activa, continuidad y formulación de preguntas relevantes sin repetir datos ya dados.
- proposalClarity: 5. Claridad de la propuesta de maquinaria (ya sea explicando el proceso de compra de JYC o presentando una oferta de venta de equipo con especificaciones y condiciones claras).
- commercialValueArgumentation: 6. Argumentación del valor comercial (mayor pago neto que trade-in, pago en 24h, cobertura del 100% de desmontaje/flete, 0% comisión, o garantía/financiamiento en venta).
- objectionHandling: 7. Manejo sólido de objeciones contextuales (precio, necesidad, condición, confianza, tiempo, proveedor actual o logística).
- negotiationWithoutPressure: 8. Capacidad de negociar y avanzar sin ejercer presión excesiva.
- unexpectedOpportunities: 9. Aprovechamiento y detección de oportunidades comerciales inesperadas (compra o venta de maquinaria).
- closingAndNextStep: 10. Cierre y definición de un siguiente paso concreto (obtención de correo/WhatsApp directo, envío de fotos de placa/horómetro o envío de cotización).

NOTE ON PRICING WHEN BUYING SURPLUS: When buying surplus equipment from the prospect, the salesperson should NEVER invent a blind "ballpark" price on the phone without seeing photos of the data plate and hours. Requesting photos/specs for a 24h formal appraisal earns full credit.

You must return ONLY a JSON object with this exact structure:
{
  "score": number, // 0 to 100
  "contactName": "The name of the Key Person/Prospect detected in the call (or 'Unknown' if none)",
  "companyName": "The name of the company detected in the call (or 'Unknown' if none)",
  "summary": "Brief summary of the call performance in Spanish, indicating if buying/selling opportunities were properly detected and citing examples.",
  "strengths": ["Strength 1 in Spanish with example", "Strength 2 in Spanish with example"],
  "weaknesses": ["Weakness 1 in Spanish with example", "Weakness 2 in Spanish with example"],
  "checklist": {
    "openingAndPresentation": boolean,
    "attentionGrabbing": boolean,
    "needsIdentification": boolean,
    "activeListeningAndQuestions": boolean,
    "proposalClarity": boolean,
    "commercialValueArgumentation": boolean,
    "objectionHandling": boolean,
    "negotiationWithoutPressure": boolean,
    "unexpectedOpportunities": boolean,
    "closingAndNextStep": boolean
  },
  "objectionsHandled": [
    { "objection": "Name of objection in Spanish", "handledWell": boolean, "feedback": "Brief feedback in Spanish with example" }
  ],
  "recommendations": ["Recommendation 1 in Spanish", "Recommendation 2 in Spanish"],
  "transcript": [
    { "role": "user", "text": "Trainee line..." },
    { "role": "prospect", "text": "Prospect line..." }
  ]
}`
            }
          ]
        }
      ];

      const fallbackModels = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
      let response;
      let lastError;

      for (const modelName of fallbackModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: "You are a strict machinery sales auditor. Analyze the audio and output ONLY valid JSON matching the requested schema. Do not write any markdown code blocks, just raw JSON."
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (error: any) {
          console.warn(`Model ${modelName} audio audit attempt failed:`, error.message);
          lastError = error;
          await new Promise(r => setTimeout(r, 800));
        }
      }

      if (!response) {
        throw lastError;
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error auditing call audio:", error);
      res.status(500).json({ error: error.message || "Failed to audit call audio" });
    }
  });

  app.get("/api/elevenlabs/signed-url", async (req, res) => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY || "sk_a1f695335cad3cea6e3f15491969d029aa71f353f01754e0";
      const agentId = process.env.ELEVENLABS_AGENT_ID || "agent_2501kw2zhyq8ewg9ntqm1613vhek";
      const branchId = (req.query.branchId as string) || process.env.ELEVENLABS_BRANCH_ID || "agtbrch_4801kw2zj0c7fej8qh66cv2x5are";

      const urlParams = new URLSearchParams({ agent_id: agentId });
      if (branchId) {
        urlParams.set("branch_id", branchId);
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?${urlParams.toString()}`, {
        headers: {
          "xi-api-key": apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", response.status, errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      res.json({ signedUrl: data.signed_url, agentId, branchId });
    } catch (error: any) {
      console.error("Error generating ElevenLabs signed URL:", error);
      res.status(500).json({ error: error.message || "Failed to generate signed URL" });
    }
  });

  app.get("/api/elevenlabs/credits", async (req, res) => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY || "sk_a1f695335cad3cea6e3f15491969d029aa71f353f01754e0";
      const response = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
        headers: {
          "xi-api-key": apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      const used = Number(data.character_count || 0);
      const limit = Number(data.character_limit || 0);
      const remaining = Math.max(0, limit - used);
      const percentUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 1000) / 10) : 0;
      const percentRemaining = limit > 0 ? Math.max(0, Math.round((remaining / limit) * 1000) / 10) : 0;

      res.json({
        tier: data.tier || "standard",
        status: data.status || "active",
        used,
        limit,
        remaining,
        percentUsed,
        percentRemaining,
        nextResetUnix: data.next_character_count_reset_unix || null
      });
    } catch (error: any) {
      console.error("Error fetching ElevenLabs credits:", error);
      res.status(500).json({ error: error.message || "Failed to fetch ElevenLabs credits" });
    }
  });

  app.get("/api/elevenlabs/conversation-audio/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const apiKey = process.env.ELEVENLABS_API_KEY || "sk_a1f695335cad3cea6e3f15491969d029aa71f353f01754e0";

      let retries = 4;
      let lastResponse;

      while (retries > 0) {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`, {
          headers: {
            "xi-api-key": apiKey,
            "Accept": "audio/mpeg"
          }
        });

        if (response.ok) {
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Disposition", `attachment; filename="call_recording_${conversationId}.mp3"`);
          const arrayBuffer = await response.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        }

        lastResponse = response;
        retries--;
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      const errorText = await lastResponse?.text();
      return res.status(lastResponse?.status || 500).json({ error: errorText || "Failed to fetch audio from ElevenLabs" });
    } catch (error: any) {
      console.error("Error fetching conversation audio:", error);
      res.status(500).json({ error: error.message || "Failed to fetch audio" });
    }
  });

  // ==========================================
  // Authentication & User Session API
  // ==========================================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, customName } = req.body;
      if (!username || !password || !password.trim()) {
        return res.status(400).json({ error: "El usuario y la contraseña son obligatorios." });
      }

      const user = await authenticate(username, password, customName);
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas. Verifica tu usuario y contraseña." });
      }

      if (user.blocked) {
        return res.status(403).json({ error: "Tu cuenta ha sido bloqueada por el Administrador. Por favor contacta a supervisión para reactivar tu acceso." });
      }

      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: "Internal server error during authentication" });
    }
  });

  app.get("/api/users/list", async (req, res) => {
    try {
      const users = await getAllUsersWithStats();
      res.json({ users });
    } catch (error: any) {
      console.error("Error fetching user list:", error);
      res.status(500).json({ error: "Failed to fetch user list" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { requesterRole, username, password, name } = req.body;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede crear nuevos usuarios." });
      }

      const result = await createUser(username, password, name);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, user: result.user });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error interno al crear usuario." });
    }
  });

  app.delete("/api/admin/users/:username", async (req, res) => {
    try {
      const { requesterRole } = req.body || {};
      const { username } = req.params;

      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede eliminar usuarios." });
      }

      const result = await deleteUser(username);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: `Usuario '${username}' eliminado correctamente.` });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Error interno al eliminar usuario." });
    }
  });

  app.post("/api/admin/users/toggle-block", async (req, res) => {
    try {
      const { requesterRole, targetUsername } = req.body;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede bloquear o desbloquear usuarios." });
      }
      if (!targetUsername) {
        return res.status(400).json({ error: "Debes especificar el usuario a modificar." });
      }

      const result = await toggleUserBlock(targetUsername);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ 
        success: true, 
        blocked: result.blocked, 
        message: result.blocked 
          ? `Usuario '@${targetUsername}' bloqueado correctamente. No podrá iniciar sesión.` 
          : `Usuario '@${targetUsername}' reactivado correctamente.` 
      });
    } catch (error: any) {
      console.error("Error toggling user block:", error);
      res.status(500).json({ error: "Error interno al cambiar estado de bloqueo del usuario." });
    }
  });

  app.post("/api/users/change-password", async (req, res) => {
    try {
      const { requesterRole, targetUsername, newPassword } = req.body;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede cambiar contraseñas." });
      }
      if (!targetUsername || !newPassword || !newPassword.trim()) {
        return res.status(400).json({ error: "Debes especificar el usuario y la nueva contraseña." });
      }

      const updated = await updateUserPassword(targetUsername, newPassword);
      if (!updated) {
        return res.status(404).json({ error: `Usuario '${targetUsername}' no encontrado en la base de datos.` });
      }

      res.json({ success: true, message: `Contraseña de ${targetUsername} actualizada correctamente en la base de datos.` });
    } catch (error: any) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Error interno al actualizar la contraseña" });
    }
  });

  // ==========================================
  // Central Database History & Audit API
  // ==========================================
  app.get("/api/history", async (req, res) => {
    try {
      const { role, userId, userName } = req.query;
      const history = await getHistory({
        role: role as string,
        userId: userId as string,
        userName: userName as string
      });
      res.json({ history });
    } catch (error: any) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to load history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const item = req.body;
      if (!item || item.score === undefined) {
        return res.status(400).json({ error: "Invalid history item data" });
      }

      const saved = await saveHistoryItem(item);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      console.error("Error saving history item:", error);
      res.status(500).json({ error: "Failed to save history item to database" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteHistoryItem(id);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error("Error deleting history item:", error);
      res.status(500).json({ error: "Failed to delete history item" });
    }
  });

  app.post("/api/history/clear", async (req, res) => {
    try {
      const { userId, role } = req.body;
      if (role === 'admin') {
        await clearHistory(userId ? { userId } : undefined);
      } else if (userId) {
        await clearHistory({ userId });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error clearing history:", error);
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  app.get("/api/trainees", async (req, res) => {
    try {
      const trainees = await getRegisteredTrainees();
      res.json({ trainees });
    } catch (error: any) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ error: "Failed to fetch trainees" });
    }
  });

  // ==========================================
  // Audio Persistence API
  // ==========================================
  app.post("/api/audios/upload", async (req, res) => {
    try {
      const { id, audioBase64, mimeType } = req.body;
      if (!id || !audioBase64) {
        return res.status(400).json({ error: "Missing audio id or data" });
      }

      const audioUrl = await saveAudioFile(id, audioBase64, mimeType || 'audio/mpeg');
      res.json({ success: true, audioUrl });
    } catch (error: any) {
      console.error("Error saving audio file:", error);
      res.status(500).json({ error: "Failed to save audio file" });
    }
  });

  app.get("/api/audios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const audio = await getAudioFile(id);
      if (!audio) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      const ext = audio.mimeType?.includes("wav") ? "wav" : audio.mimeType?.includes("webm") ? "webm" : "mp3";
      res.setHeader("Content-Type", audio.mimeType || "audio/mpeg");
      res.setHeader("Content-Length", audio.buffer.length);
      res.setHeader("Content-Disposition", `attachment; filename="call_recording_${id}.${ext}"`);
      res.send(audio.buffer);
    } catch (error: any) {
      console.error("Error retrieving audio file:", error);
      res.status(500).json({ error: "Failed to stream audio file" });
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
