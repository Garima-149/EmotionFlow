import { useEffect, useRef, useState ,useContext} from "react";
import Webcam from "react-webcam";
import io from "socket.io-client";
import "../Styles/detectEmotion.css";
import "../Styles/global.css";
import "../Styles/navbar.css";
import { AuthContext } from "./AuthContext";

const socket = io("https://your-backend.onrender.com");

export default function DetectEmotion() {
  const webcamRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [emotion, setEmotion] = useState("Detecting...");
  const [recommendation, setRecommendation] = useState("Initializing AI...");
  const [cameraOn, setCameraOn] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // ✅ LOCK after first valid result

  // Ask camera permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setCameraOn(true))
      .catch(() => setCameraOn(false));
  }, []);

  // Capture frames every 2 seconds
  useEffect(() => {
    if (!cameraOn) return;
    if (isLocked) return; // ✅ STOP if locked
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const image = webcamRef.current.getScreenshot();
        socket.emit("frame", {
          image,
          userId: user?.id, // ✅ from AuthContext
        });
      }
    }, 2000);

    socket.on("result", (data) => {
      setEmotion(data.emotion);
      setRecommendation(data.recommendation);
      if (data.emotion && data.emotion !== "unknown") {
        setIsLocked(true); // ✅ LOCK on valid emotion
      }
      localStorage.setItem("studyPlan", JSON.stringify(data.plan));
      window.dispatchEvent(new Event("studyPlanUpdated"));
    });

    return () => {
      clearInterval(interval);
      socket.off("result");
    };
  }, [cameraOn, isLocked]);

  return (
    <div className="detect-container">
      <h1 className="page-title">Live Emotion Detection</h1>

      <div className="detect-card">
        {/* Webcam Section */}
        <div className="camera-section">
          {cameraOn ? (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
              videoConstraints={{ facingMode: "user" }}
            />
          ) : (
            <div className="camera-off">
              <p>Camera access denied</p>
            </div>
          )}
        </div>

        {/* Emotion Result */}
        <div className="result-section">
          <div className="emotion-box">
            <h3>Current Emotion</h3>
            <p className="emotion-text">{emotion}</p>
          </div>

          <div className="recommend-box">
            <h3>AI Recommendation</h3>
            <p className="emotion-text">{recommendation}</p>
          </div>

          <p className="privacy-note">
            🔒 Your camera feed is processed in real-time. No images or videos
            are stored.
          </p>
        </div>
      </div>
    </div>
  );
}
