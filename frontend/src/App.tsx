import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import PersonaSelect from './pages/PersonaSelect';
import VoiceChat from './pages/VoiceChat';
import MoodSummary from './pages/MoodSummary';
import AuthPage from './pages/AuthPage';

// Protected Route — allow logged-in users OR anonymous sessions
const ProtectedRoute = ({ children }: any) => {
  const token = localStorage.getItem("ec_token");
  const anonId = sessionStorage.getItem("ec_anon_id");
  return token || anonId ? children : <Navigate to="/auth" />;
};

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* ✅ Hide Navbar on Auth Page */}
      {location.pathname !== "/auth" && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/landing" element={
          <ProtectedRoute><Landing /></ProtectedRoute>
        } />

        <Route path="/persona" element={
          <ProtectedRoute><PersonaSelect /></ProtectedRoute>
        } />

        <Route path="/chat/:personaId" element={
          <ProtectedRoute><VoiceChat /></ProtectedRoute>
        } />

        <Route path="/summary" element={
          <ProtectedRoute><MoodSummary /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}