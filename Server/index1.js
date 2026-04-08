import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "./index.js";
import "./server.js";
const app = express();

// ✅ Middleware
app.use(cors({
  origin: "*", // allow frontend
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://garimachandra149:Garima1490@emotionflow.mvwgjit.mongodb.net/?appName=EmotionFlow")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

// ✅ Schema (with validation)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true   // prevents duplicate users
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", UserSchema);

// ✅ TEST ROUTE (IMPORTANT for debugging)
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  console.log("📩 Incoming:", req.body);

  const { email, password } = req.body;

  // 🔥 Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" }); 
    }

    const newUser = new User({ email, password });
    await newUser.save();

    console.log("✅ User Saved in DB");

    res.status(200).json({
      success: true,
      message: "Signup successful",
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });

  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  console.log("🔐 Login Request:", req.body);

  const { email, password } = req.body;

  // 🔥 Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const user = await User.findOne({ email });

    // ❌ User not found
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ❌ Wrong password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Success
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id:user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.log("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/google-login", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    // 🟢 CASE 1: USER EXISTS
    if (user) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email
        }
      });
    }
   else{
     return res.status(400).json({ message: "User not found" });
   }
    

  } catch (err) {
    console.log("❌ Google Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const RecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  focusScore: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Record = mongoose.model("Record", RecordSchema);

app.post("/add-record", async (req, res) => {
  const { userId, mood, focusScore } = req.body;

  try {
    const record = new Record({ userId, mood, focusScore });
    await record.save();

    res.status(200).json({ message: "Record saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving record" });
  }
});

app.get("/records/:userId", async (req, res) => {
  try {
    const records = await Record.find({ userId: req.params.userId })
      .sort({ createdAt: 1 }); // oldest → latest

    res.status(200).json(records);

  } catch (err) {
    console.log("❌ Fetch Error:", err);
    res.status(500).json({ message: "Error fetching records" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
