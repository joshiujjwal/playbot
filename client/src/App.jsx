import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Landing from './pages/Landing';
import HostLobby from './pages/HostLobby';
import PlayerLobby from './pages/PlayerLobby';
import HostGame from './pages/HostGame';
import PlayerGame from './pages/PlayerGame';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/host/lobby" element={<HostLobby />} />
          <Route path="/player/lobby" element={<PlayerLobby />} />
          <Route path="/host/game" element={<HostGame />} />
          <Route path="/player/game" element={<PlayerGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
