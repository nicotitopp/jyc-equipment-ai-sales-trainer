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

  app.post("/api/audit-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType, contactName, companyName, language } = req.body;

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
              text: `Please listen to and evaluate this cold call audio recording. The representative (Trainee) is a buyer from JYC Equipment contacting a prospect named "${contactName}" representing "${companyName}" regarding used heavy machinery.
The representative's primary goal is to BUY used heavy equipment (forklifts, wheel loaders, excavators, crushers, etc.) from the company.

First, transcribe the entire call dialogue accurately as a list of spoken lines, separating the "Trainee" and the "Prospect", and include it in the "transcript" property of the output JSON.

Then, evaluate the call against the JYC cold call purchasing script. Write all critique details (summary, strengths, weaknesses, objectionsHandled feedback, recommendations) in the user's primary language: Spanish.

Verify the following items and build the checklist of what details the trainee gathered/asked:
- gatekeeperBypass: Did they introduce themselves to the operator and successfully reach/bypass to the Key Person (KP) named "${contactName}"?
- kpOpening: Did they use the correct script opening with the KP (asked if it was a bad time, introduced JYC Equipment, and checked if they have any equipment for sale right now or coming up this year)?
- equipmentQualification: IF the prospect has equipment for sale: did they ask the qualification questions (Make, Model, Year, Condition/Repairs) for the machine mentioned by the prospect? (If no equipment was available, mark as true if they confirmed this).
- futureReference: IF the prospect does NOT have equipment for sale: did they ask the reference questions to gather company information (process for surplus, if they buy used, branches, loaders/forklifts used)? (If equipment was available, mark as true).
- priceAndAssets: Did they ask for a target price and request pictures of the machine, the data plate, and the hour meter?
- objectionHandling: Did they address and try to overcome the prospect's objections (e.g., they prefer auctions, want to trade-in, have bank leases, already sold, or want a price first)?
- nextStepsSecure: Did they successfully get the prospect's personal contact details (WhatsApp or email) and establish clear next steps for a follow-up or callback?

You must return ONLY a JSON object with this exact structure:
{
  "score": number, // 0 to 100
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are a strict construction machinery sales auditor. Analyze the audio and output ONLY valid JSON matching the requested schema. Do not write any markdown code blocks, just raw JSON."
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error auditing call audio:", error);
      res.status(500).json({ error: error.message || "Failed to audit call audio" });
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
