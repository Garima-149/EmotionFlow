import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("emotionflow-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Invalid stored user", err);
      localStorage.removeItem("emotionflow-user");
    }
    setLoading(false);
  }, []);

  const setAuthUser = (userData) => {
    setUser(userData);
    localStorage.setItem("emotionflow-user", JSON.stringify(userData));
  };

  const login = setAuthUser;
  const signup = setAuthUser;

  const logout = () => {
    setUser(null);
    localStorage.removeItem("emotionflow-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
