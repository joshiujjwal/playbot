import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import './Landing.css';

function Landing() {
  const { createRoom, joinRoom, error, clearError, connected } = useSocket();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');

  const handleCreateRoom = () => {
    createRoom('so-clover');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim() && nickname.trim()) {
      joinRoom(roomCode.trim(), nickname.trim());
    }
  };

  const handleBack = () => {
    setMode(null);
    setRoomCode('');
    setNickname('');
    clearError();
  };

  if (!connected) {
    return (
      <div className="landing-container">
        <div className="landing-card">
          <h1>Playbot</h1>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (mode === null) {
    return (
      <div className="landing-container">
        <div className="landing-card">
          <h1>Playbot</h1>
          <p className="subtitle">Jackbox-style Multiplayer Games</p>

          <div className="button-group">
            <button className="primary-button" onClick={handleCreateRoom}>
              Create Room
            </button>
            <button className="secondary-button" onClick={() => setMode('join')}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="landing-container">
        <div className="landing-card">
          <h1>Join Room</h1>

          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="roomCode">Room Code</label>
              <input
                id="roomCode"
                type="text"
                placeholder="ABCD"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="nickname">Your Nickname</label>
              <input
                id="nickname"
                type="text"
                placeholder="Enter your name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="submit" className="primary-button">
                Join
              </button>
              <button type="button" className="secondary-button" onClick={handleBack}>
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

export default Landing;
