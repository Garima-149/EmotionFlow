import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
 
import "../Styles/auth.css";
import "../Styles/global.css";
import "../Styles/navbar.css";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
     console.log("EVENT:", e);
    e.preventDefault();
    try {
      const res=await fetch("https://emotion-backend-fmir.onrender.com/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

   const data = await res.json();

      if (res.ok) {
        alert("Signup successful");
        signup(data.user); // your context
        navigate("/dashboard"); // ✅ FIXED
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } 
  
  };
  
  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Start your focus and wellness journey with EmotionFlow.
        </p>

        <form className="auth-form" onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
