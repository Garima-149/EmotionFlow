import MemoryGame from "./MemoryGame";
import ReactionGame from "./ReactionGame";
import BreathingGame from "./BreathingGame";
import "../Styles/global.css";
import "../Styles/navbar.css";
import "../Styles/mood.css";

export default function MoodBoost() {
  return (
    <div style={{ padding: "40px" }}>
      
      {/* Page Heading */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "-70px",
          color: "#f8fafc",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Refresh Your Mind
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
            color: "#e5e7eb",
          }}
        >
          Take a short mental break with these science-backed activities.
          Designed to relax your mind, improve focus, and help you return to
          studying with renewed energy.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid">
        <MemoryGame />
        <ReactionGame />
        <BreathingGame />
      </div>
    </div>
  );
}
