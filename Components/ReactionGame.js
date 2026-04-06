import { useState } from "react";
import '../Styles/global.css';
import '../Styles/navbar.css';
import '../Styles/mood.css';

export default function ReactionGame() {
  const [message, setMessage] = useState("Click Start");
  const [startTime, setStartTime] = useState(null);

  function startGame() {
    setMessage("Wait...");
    setTimeout(() => {
      setMessage("CLICK NOW!");
      setStartTime(Date.now());
    }, Math.random() * 3000 + 1000);
  }

  function handleClick() {
    if (!startTime) return;
    const reaction = Date.now() - startTime;
    setMessage(`Reaction Time: ${reaction} ms`);
    setStartTime(null);
  }

  return (
    <div className="card">
      <h3>⚡ Reaction Test</h3>
      <button onClick={startGame}>Start</button>
      <div
        className="reaction-box"
        onClick={handleClick}
      >
        {message}
      </div>
    </div>
  );
}
