import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>
        Loading EmotionFlow...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}
