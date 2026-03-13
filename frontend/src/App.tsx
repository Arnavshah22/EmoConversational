import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import PersonaSelect from './pages/PersonaSelect';
import VoiceChat from './pages/VoiceChat';
import MoodSummary from './pages/MoodSummary';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/persona" element={<PersonaSelect />} />
        <Route path="/chat/:personaId" element={<VoiceChat />} />
        <Route path="/summary" element={<MoodSummary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
