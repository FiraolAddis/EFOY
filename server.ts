import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for the MVP
  let userProfile: any = null;
  const checkIns: any[] = [];
  let latestWellnessResult: any = null;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/profile", (req, res) => {
    res.json(userProfile || {});
  });

  app.post("/api/profile", (req, res) => {
    userProfile = req.body;
    res.json({ success: true });
  });

  app.get("/api/check-ins", (req, res) => {
    res.json(checkIns);
  });

  app.get("/api/wellness", (req, res) => {
    res.json(latestWellnessResult);
  });

  app.post("/api/check-in", async (req, res) => {
    try {
      const checkIn = req.body;
      checkIns.push({ ...checkIn, date: new Date().toISOString() });

      // Calculate AI wellness score
      const prompt = `
        You are an advanced AI Wellness Coach. 
        User Profile Context: ${JSON.stringify(userProfile)}
        Recent Check-in Data: ${JSON.stringify(checkIn)}

        Based on this data, assess the user's mental well-being.
        Return ONLY a JSON response matching this schema (do not wrap in markdown):
        {
          "score": number (0-100),
          "status": "optimal" | "moderate" | "warning" | "red_zone",
          "insights": string (brief paragraph explaining the score based on their specific profile and check-in),
          "recommendations": string[] (3 actionable micro-interventions tailored to them)
        }
        
        If stress is high or energy is very low combined with their known issues, strongly consider "warning" or "red_zone".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "");
      const result = JSON.parse(responseText);

      latestWellnessResult = result;
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process check-in" });
    }
  });

  app.post("/api/symptom-search", async (req, res) => {
    try {
      const { symptoms } = req.body;
      const prompt = `
        You are a medical information AI integrated into a wellness app. 
        The user has reported the following symptoms: ${symptoms}.
        
        User Profile Context (for framing ONLY, do not diagnose): ${JSON.stringify(userProfile)}
        
        Provide reasonable possible causes with a strong emphasis on the interplay between physical symptoms and mental health (e.g., how stress might cause headaches or heart palpitations). 
        Include a disclaimer that this is not medical advice.
        
        Format your response nicely in markdown. It should have a short intro, a section on physiological causes, a section on psychophysiological (mental) causes, and when to seek immediate help.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to search symptoms" });
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
