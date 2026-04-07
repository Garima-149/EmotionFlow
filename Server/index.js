import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});



app.get("/models", async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    res.json(response.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data });
  }
});

// ✅ CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 🔥 Validation
    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // 🔥 Gemini API Call (LATEST WORKING)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      }
    );

    // ✅ Safe extraction
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.json({
        reply: "⚠️ No response from AI"
      });
    }

    res.json({ reply });

  } catch (err) {
    console.error("❌ REAL ERROR:", err.response?.data || err.message);

    res.status(500).json({
      reply: "Gemini failed",
      error: err.response?.data || err.message
    });
  }
});

// ✅ START SERVER


//const PORT = process.env.PORT || 4000;
//server.listen(PORT, () => {
//  console.log(`Server running on ${PORT}`);
//});
