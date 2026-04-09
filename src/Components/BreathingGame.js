import { useState, useEffect } from "react";
import '../Styles/global.css';
import '../Styles/navbar.css';
import '../Styles/mood.css';

export default function BreathingGame() {
  const steps = ["Inhale 😮‍💨", "Hold 🫁", "Exhale 😌"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card breathing">
      <h3>🌿 Breathing Exercise</h3>
      <div className="breath-circle">{steps[step]}</div>
    </div>
  );
}
