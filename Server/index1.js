import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ SOCKET (moved from server.js)
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  },
});

// ✅ Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB (same as your code)
mongoose.connect("mongodb+srv://garimachandra149:CmHn9XOdk9PkIztb@emotionflow.mvwgjit.mongodb.net/?appName=EmotionFlow")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

// ================= USER =================

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

// ================= RECORD =================

const RecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  focusScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Record = mongoose.model("Record", RecordSchema);

// ================= ROUTES (UNCHANGED) =================

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const newUser = new User({ email, password });
  await newUser.save();

  res.json({
    success: true,
    user: { id: newUser.id, email: newUser.email }
  });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });
  if (user.password !== password)
    return res.status(400).json({ message: "Invalid password" });

  res.json({
    success: true,
    user: { id: user.id, email: user.email }
  });
});

// GOOGLE LOGIN
app.post("/google-login", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "User not found" });

  res.json({
    success: true,
    user: { id: user.id, email: user.email }
  });
});

// RECORD
app.post("/add-record", async (req, res) => {
  const { userId, mood, focusScore } = req.body;

  const record = new Record({ userId, mood, focusScore });
  await record.save();

  res.json({ message: "Record saved" });
});

app.get("/records/:userId", async (req, res) => {
  const records = await Record.find({ userId: req.params.userId })
    .sort({ createdAt: 1 });

  res.json(records);
});

// ================= CHAT (FROM index.js) =================

app.get("/models", async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({ reply: "Message is required" });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ reply: reply || "⚠️ No response from AI" });

  } catch (err) {
    res.status(500).json({
      reply: "Gemini failed",
      error: err.response?.data || err.message
    });
  }
});

// ================= EMOTION (UNCHANGED) =================

async function analyzeEmotionAndPlan(base64Image) {
  const prompt = `YOUR SAME PROMPT HERE`; // 👈 keep your original prompt

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
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: { temperature: 0.2 }
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// ================= SOCKET (UNCHANGED) =================

io.on("connection", (socket) => {
  console.log("User connected");

  let isLocked = false;

  socket.on("frame", async ({ image, userId }) => {
    try {
      if (!image || !userId || isLocked) return;

      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

      const aiResponse = await analyzeEmotionAndPlan(base64Image);

      let cleaned = aiResponse
        ?.replace(/```json/g, "")
        ?.replace(/```/g, "")
        ?.trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      let parsed;

      try {
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      } catch {
        parsed = {
          emotion: "unknown",
          recommendation: "AI failed",
          plan: { do: ["Try again"], avoid: ["AI error"] }
        };
      }

      if (parsed.emotion && parsed.emotion !== "unknown") {
        isLocked = true;
      }

      let focusScore = 50;

      switch (parsed.emotion) {
        case "focused": focusScore = 90; break;
        case "happy": focusScore = 75; break;
        case "neutral": focusScore = 60; break;
        case "stressed": focusScore = 40; break;
        case "sad": focusScore = 30; break;
      }

      await axios.post(
        `${process.env.BASE_URL}/add-record`,
        { userId, mood: parsed.emotion, focusScore }
      );

      socket.emit("result", {
        emotion: parsed.emotion,
        recommendation: parsed.recommendation,
        plan: parsed.plan
      });

      io.emit("dashboardUpdate", {
        userId,
        emotion: parsed.emotion,
        recommendation: parsed.recommendation,
        plan: parsed.plan
      });

    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }
  });
});

// ================= START =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
