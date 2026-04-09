import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials:true
  },
});

app.use(cors());

// 🔥 GEMINI: Emotion + Study Plan from Image
async function analyzeEmotionAndPlan(base64Image) {
  const prompt = `
You are an AI study assistant.

STRICT RULES:
- ALWAYS include ALL fields
- NEVER skip any field
- NEVER return partial JSON

Tasks:
1. Detect emotion
2. Give 1-line recommendation
3. Give 4-point study plan

Return ONLY valid JSON.

Format:
{
  "emotion": "happy | sad | stressed | focused | neutral",
  "recommendation": "1 line advice (MANDATORY)",
  "plan": {
    "do": ["point 1", "point 2"],
    "avoid": ["point 3", "point 4"]
  }
}
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2, // ✅ more stable output
      },
    },
  );

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

  return text;
}

// 🔌 SOCKET
io.on("connection", (socket) => {
  console.log("User connected");

  let isLocked = false; // ✅ LOCK FLAG

  socket.on("frame", async (data) => {
    const { image, userId } = data; // ✅ NOW AVAILABLE
    try {
      if (!image || !userId || isLocked) return;

      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

      const aiResponse = await analyzeEmotionAndPlan(base64Image);

      // ✅ CLEAN RESPONSE
      let cleaned = aiResponse
        ?.replace(/```json/g, "")
        ?.replace(/```/g, "")
        ?.trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      let parsed;

      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
        parsed = {
          emotion: parsed.emotion || "unknown",
          recommendation:
            parsed.recommendation ||
            "Stay consistent and take short breaks to maintain focus", // ✅ DEFAULT RECOMMENDATION
          plan: parsed.plan || {
            do: ["Focus on small tasks"],
            avoid: ["Distractions"],
          },
        };
      } catch (err) {
        parsed = {
          emotion: "unknown",
          recommendation: "AI failed",
          plan: {
            do: ["Try again"],
            avoid: ["AI error"],
          },
        };
      }

      // ✅ LOCK
      if (parsed.emotion && parsed.emotion !== "unknown") {
        isLocked = true;
      }

      // 🎯 CONVERT EMOTION → FOCUS SCORE
let focusScore = 50;

switch (parsed.emotion) {
  case "focused":
    focusScore = 90;
    break;
  case "happy":
    focusScore = 75;
    break;
  case "neutral":
    focusScore = 60;
    break;
  case "stressed":
    focusScore = 40;
    break;
  case "sad":
    focusScore = 30;
    break;
  default:
    focusScore = 50;
      }
      
   await axios.post("https://emotion-backend-fmir.onrender.com/add-record", {
  userId,
  mood: parsed.emotion,
  focusScore
});   
  
      socket.emit("result", {
        emotion: parsed.emotion,
        recommendation: parsed.recommendation, // ✅ KEEP THIS
        plan: parsed.plan, // ✅ ADD THIS
      });

      io.emit("dashboardUpdate", {
        userId: userId, // NOT socket.id
        emotion: parsed.emotion,
        recommendation: parsed.recommendation,
        plan: parsed.plan,
      });

    } catch (err) {
      console.log("❌ ERROR:", err.response?.data || err.message);

      socket.emit("result", {
        emotion: "error",
        mode: "AI failed",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//const PORT = process.env.PORT || 5001;
//server.listen(PORT, () => {
 // console.log(`Server running on ${PORT}`);
//});
