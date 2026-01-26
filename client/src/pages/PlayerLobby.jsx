import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

function PlayerLobby() {
  const { roomCode, players, leaveRoom } = useSocket();
  const navigate = useNavigate();

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1>Joined Room</h1>
          <div className="room-code-display">{roomCode}</div>
          <p className="lobby-subtitle">Waiting for host to start...</p>
        </div>

        <div className="lobby-content">
          <div className="game-info">
            <h2>Game: So Clover!</h2>
            <p>Players: {players.length}/6</p>
          </div>

          <div className="players-list">
            <h3>Players in Lobby</h3>
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">{player.nickname}</span>
                {player.isHost && <span className="host-badge">HOST</span>}
              </div>
            ))}
          </div>

          <div className="lobby-actions">
            <button className="secondary-button" onClick={handleLeave}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerLobby;
