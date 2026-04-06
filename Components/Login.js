import { useContext, useState} from "react";
import { useNavigate ,Link} from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase.js";
import "../Styles/auth.css";
import "../Styles/global.css";
import "../Styles/navbar.css";
import axios from "axios";

export default function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

  
  const handleLogin = async (e) => {
  e.preventDefault();

  const res = await fetch("https://your-backend.onrender.com/login", {
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
    login(data.user); // your context
    navigate("/dashboard");
  } else {
    alert(data.message);
  }
  };
  
  

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Call backend
    const res = await axios.post("https://your-backend.onrender.com/google-login", {
      email: user.email
    });

    if (res.data.success) {
      login(res.data.user); // store full user (id + email)
      navigate("/dashboard");
    }
    else {
      alert(res.data.message || "Google login failed");
    }

  } catch (err) {
    console.log("❌ Google Login Error:", err);
  }
};
  
  return (
    <div className="auth-page">

    <div className="auth-logo">
    
  </div>
      <div className="auth-wrapper">
        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Log in to continue your personalized focus journey.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
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

          <button type="submit">Login</button>
        </form>
        <button onClick={handleGoogleLogin} className="google-btn">
  Continue with Google
</button>
              <p className="auth-footer">
          Don’t have an account? <span><Link to="/signup">Sign up</Link></span>
        </p>
      </div>
    </div>
  );
}
