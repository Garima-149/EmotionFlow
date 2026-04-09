import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Components/Dashboard";
import DetectEmotion from "./Components/DetectEmotion";
import StudyPlan from "./Components/StudyPlan";
import MoodBoost from "./Components/MoodBoost";
import CameraPermission from "./Components/CameraPermission";
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/Navbar";
import ChatBot from "./Components/Chatbot";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/camera" element={<ProtectedRoute><CameraPermission /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/detect" element={<ProtectedRoute><DetectEmotion /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute><MoodBoost /></ProtectedRoute>} />
        </Routes>
        <ChatBot/>
      </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
