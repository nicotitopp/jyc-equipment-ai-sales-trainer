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
  ensureDirectories,
  updateUserPassword,
  getAllUsers,
  createUser,
  deleteUser,
  getAllUsersWithStats
} from "./server/db";

dotenv.config();

async function startServer() {
  ensureDirectories();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
              text: `Please listen to and evaluate this cold call audio recording. The representative (Trainee) is a buyer from JYC Equipment contacting a prospect (Key Person) representing a business regarding used heavy machinery.
The representative's primary goal is to BUY used heavy equipment (forklifts, wheel loaders, reach stackers, empty container handlers, standard or electric forklifts, excavators, etc.) from the company.

First, transcribe the entire call dialogue accurately as a list of spoken lines, separating the "Trainee" and the "Prospect", and include it in the "transcript" property of the output JSON.
Listen to the audio to determine the language spoken, but write all critique details (summary, strengths, weaknesses, objectionsHandled feedback, recommendations) in Spanish.

Verify the following items and build the checklist of what details the trainee gathered/asked:
- gatekeeperBypass: Did they introduce themselves to the operator and successfully reach/bypass to the Key Person (KP) of the company?
- kpOpening: Did they use the correct script opening with the KP (asked if it was a bad time, introduced JYC Equipment, and checked if they have any equipment for sale right now or coming up this year)?
- equipmentQualification: IF the prospect has equipment for sale: did they ask the qualification questions (Make, Model, Year, Condition/Repairs) for the machine mentioned by the prospect? (If no equipment was available, mark as true if they confirmed this).
- futureReference: IF the prospect does NOT have equipment for sale: did they ask the reference questions to gather company information (process for surplus, if they buy used, branches, loaders/forklifts used)? (If equipment was available, mark as true).
- priceAndAssets: Did they ask for a target price and request pictures of the machine, the data plate, and the hour meter?
- objectionHandling: Did they address and try to overcome the prospect's objections (e.g., they prefer auctions, want to trade-in, have bank leases, already sold, or want a price first)?
- nextStepsSecure: Did they successfully get the prospect's personal contact details (WhatsApp or email) and establish clear next steps for a follow-up or callback?

You must return ONLY a JSON object with this exact structure:
{
  "score": number, // 0 to 100
  "contactName": "The name of the Key Person/Prospect detected in the call (or 'Unknown' if none)",
  "companyName": "The name of the company detected in the call (or 'Unknown' if none)",
  "summary": "Brief summary of the call performance in Spanish.",
  "strengths": ["Strength 1 in Spanish", "Strength 2 in Spanish", ...],
  "weaknesses": ["Weakness 1 in Spanish", "Weakness 2 in Spanish", ...],
  "checklist": {
    "gatekeeperBypass": boolean,
    "kpOpening": boolean,
    "equipmentQualification": boolean,
    "futureReference": boolean,
    "priceAndAssets": boolean,
    "objectionHandling": boolean,
    "nextStepsSecure": boolean
  },
  "objectionsHandled": [
    { "objection": "Name of objection (e.g. Auction, Lease, Trade-in) in Spanish", "handledWell": boolean, "feedback": "Brief feedback in Spanish" }
  ],
  "recommendations": ["Recommendation 1 in Spanish", "Recommendation 2 in Spanish", ...],
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

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
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
      res.json({ signedUrl: data.signed_url, agentId });
    } catch (error: any) {
      console.error("Error generating ElevenLabs signed URL:", error);
      res.status(500).json({ error: error.message || "Failed to generate signed URL" });
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
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password, customName } = req.body;
      if (!username || !password || !password.trim()) {
        return res.status(400).json({ error: "El usuario y la contraseña son obligatorios." });
      }

      const user = authenticate(username, password, customName);
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas. Para admin use usuario 'admin' y clave 'admin123'. Para practicante use 'practicante' y clave 'jyc123'." });
      }

      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: "Internal server error during authentication" });
    }
  });

  app.get("/api/users/list", (req, res) => {
    try {
      const users = getAllUsersWithStats();
      res.json({ users });
    } catch (error: any) {
      console.error("Error fetching user list:", error);
      res.status(500).json({ error: "Failed to fetch user list" });
    }
  });

  app.post("/api/admin/users", (req, res) => {
    try {
      const { requesterRole, username, password, name } = req.body;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede crear nuevos usuarios." });
      }

      const result = createUser(username, password, name);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, user: result.user });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error interno al crear usuario." });
    }
  });

  app.delete("/api/admin/users/:username", (req, res) => {
    try {
      const { requesterRole } = req.body || {};
      const { username } = req.params;

      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede eliminar usuarios." });
      }

      const result = deleteUser(username);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: `Usuario '${username}' eliminado correctamente.` });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Error interno al eliminar usuario." });
    }
  });

  app.post("/api/users/change-password", (req, res) => {
    try {
      const { requesterRole, targetUsername, newPassword } = req.body;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Permiso denegado. Solo un administrador puede cambiar contraseñas." });
      }
      if (!targetUsername || !newPassword || !newPassword.trim()) {
        return res.status(400).json({ error: "Debes especificar el usuario y la nueva contraseña." });
      }

      const updated = updateUserPassword(targetUsername, newPassword);
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
  app.get("/api/history", (req, res) => {
    try {
      const { role, userId, userName } = req.query;
      const history = getHistory({
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

  app.post("/api/history", (req, res) => {
    try {
      const item = req.body;
      if (!item || !item.score === undefined) {
        return res.status(400).json({ error: "Invalid history item data" });
      }

      const saved = saveHistoryItem(item);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      console.error("Error saving history item:", error);
      res.status(500).json({ error: "Failed to save history item to database" });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    try {
      const { id } = req.params;
      const deleted = deleteHistoryItem(id);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error("Error deleting history item:", error);
      res.status(500).json({ error: "Failed to delete history item" });
    }
  });

  app.post("/api/history/clear", (req, res) => {
    try {
      const { userId, role } = req.body;
      // Only admin can clear all, trainees can only clear their own
      if (role === 'admin') {
        clearHistory(userId ? { userId } : undefined);
      } else if (userId) {
        clearHistory({ userId });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error clearing history:", error);
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  app.get("/api/trainees", (req, res) => {
    try {
      const trainees = getRegisteredTrainees();
      res.json({ trainees });
    } catch (error: any) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ error: "Failed to fetch trainees" });
    }
  });

  // ==========================================
  // Audio Persistence API
  // ==========================================
  app.post("/api/audios/upload", (req, res) => {
    try {
      const { id, audioBase64, mimeType } = req.body;
      if (!id || !audioBase64) {
        return res.status(400).json({ error: "Missing audio id or data" });
      }

      const audioUrl = saveAudioFile(id, audioBase64, mimeType || 'audio/mpeg');
      res.json({ success: true, audioUrl });
    } catch (error: any) {
      console.error("Error saving audio file:", error);
      res.status(500).json({ error: "Failed to save audio file" });
    }
  });

  app.get("/api/audios/:id", (req, res) => {
    try {
      const { id } = req.params;
      const audio = getAudioFile(id);
      if (!audio) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      res.setHeader("Content-Type", audio.mimeType);
      res.setHeader("Content-Length", audio.buffer.length);
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
