import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

function HostLobby() {
  const { roomCode, players, startGame, leaveRoom, gameType } = useSocket();
  const navigate = useNavigate();

  const handleStartGame = () => {
    if (players.length >= 2 && players.length <= 6) {
      startGame();
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const canStart = players.length >= 2 && players.length <= 6;

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1>Room Code</h1>
          <div className="room-code-display">{roomCode}</div>
          <p className="lobby-subtitle">Share this code with players</p>
        </div>

        <div className="lobby-content">
          <div className="game-info">
            <h2>Game: So Clover!</h2>
            <p>Players: {players.length}/6</p>
          </div>

          <div className="players-list">
            <h3>Players in Lobby</h3>
            {players.length === 0 && <p className="no-players">Waiting for players...</p>}
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">{player.nickname}</span>
                {player.isHost && <span className="host-badge">HOST</span>}
              </div>
            ))}
          </div>

          <div className="lobby-actions">
            {!canStart && (
              <p className="info-message">Need 2-6 players to start</p>
            )}
            <button
              className="primary-button"
              onClick={handleStartGame}
              disabled={!canStart}
            >
              Start Game
            </button>
            <button className="secondary-button" onClick={handleLeave}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostLobby;
