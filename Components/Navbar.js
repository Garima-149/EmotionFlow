import { Link,useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import "../Styles/navbar.css";


export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    // clear auth state
    localStorage.removeItem("studyPlan");
    navigate("/");    // redirect to login page
  };

  const isAuthPage =
    location.pathname === "/login";

  return (
    <nav className={`navbar ${isAuthPage ? "navbar-blur" : ""}`}>
      <h2>EmotionFlow</h2>

      {user && (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/detect">Detect</Link>
          <Link to="/study">Study Plan</Link>
          <Link to="/mood">Mood Boost</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
