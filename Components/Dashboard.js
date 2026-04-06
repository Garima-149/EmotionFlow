import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import "../Styles/global.css";
import "../Styles/dashboard.css";
import "../Styles/navbar.css";
import io from "socket.io-client";

const socket = io("https://your-backend.onrender.com");

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    focusScore: 0,
    mood: "N/A",
    burnout: "N/A",
    emotion: "N/A"
   
  });

  function get(emotion) {
  switch (emotion) {
    case "focused":
      return 90;
    case "happy":
      return 75;
    case "neutral":
      return 60;
    case "sad":
      return 40;
    case "stressed":
      return 25;
    default:
      return 50;
  }
} 
  useEffect(() => {
  if (!user) return;

  socket.on("dashboardUpdate", (data) => {
    if (data.userId === user.id) {
      setStats(prev => ({
        ...prev,
        focusScore: get(data.emotion),
        emotion: data.emotion,
        mood: data.emotion, // sync mood with emotion
        burnout: data.emotion === "stressed" ? "High" : "Low"
      }));
    }
  });

  return () => socket.off("dashboardUpdate");
  }, [user]);
  


  useEffect(() => {
    if (user) {
      fetch(`https://your-backend.onrender.com/records/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            const latest = data[data.length - 1];

            setStats({
              focusScore: latest.focusScore || 0,
              mood: latest.mood || latest.emotion || "N/A",
              burnout: latest.focusScore < 40 ? "High" : "Low",
              emotion: latest.emotion || "N/A"
            });
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  

  return (
    <div className="dashboard">
      <h1 style={{ marginLeft: "455px" }}>
        Welcome, {user?.email || "Guest@gmail.com"}
      </h1>

      <div className="stats">
        <div className="card focus">
          <div className="card-icon">⭐</div>
          <div className="card-title">Focus Score</div>
          <div className="card-value">{stats.focusScore}%</div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.focusScore}%` }}
            ></div>
          </div>
        </div>

        <div className="card mood">
          <div className="card-icon">😊</div>
          <div className="card-title">Mood Stability</div>
          <div className="card-value">{stats.mood}</div>
        </div>

        <div className="card burnout">
          <div className="card-icon">🔥</div>
          <div className="card-title">Burnout Risk</div>
          <div className="card-value">{stats.burnout}</div>
        </div>
      </div>
    </div>
  );
}
