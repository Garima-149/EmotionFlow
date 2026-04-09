import { useState } from "react";
import "../Styles/chatbot.css";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 I’m FlowBot. How can I help you focus today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://emotion-backend-fmir.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry 😕 I couldn’t respond." }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* CHAT ICON */}
      <div
        className="chat-icon"
        onClick={() => setOpen(!open)}
        title="Chat with FlowBot"
      >
        💬
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            FlowBot 🤖
            <span onClick={() => setOpen(false)}>✕</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">Typing...</div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              placeholder="Ask FlowBot..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
