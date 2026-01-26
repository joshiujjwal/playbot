import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import GridDisplay from './GridDisplay';
import './PlayerWritingView.css';

function PlayerWritingView({ gameState }) {
  const { sendGameInput } = useSocket();
  const [clues, setClues] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (gameState.clues) {
      setClues(gameState.clues);
    }
  }, [gameState.clues]);

  // Timer countdown
  useEffect(() => {
    if (!gameState.timer) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameState.timer.startTime;
      const remaining = Math.max(0, gameState.timer.duration - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.timer]);

  const handleClueChange = (index, value) => {
    const newClues = [...clues];
    newClues[index] = value;
    setClues(newClues);
  };

  const handleSubmit = () => {
    if (gameState.hasSubmitted) return;

    // Validate all clues are filled
    if (clues.some(clue => !clue.trim())) {
      alert('Please fill in all clues before submitting');
      return;
    }

    sendGameInput('submit-clues', { clues });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState.hasSubmitted) {
    return (
      <div className="writing-view">
        <div className="writing-container">
          <h1>Clues Submitted!</h1>
          <p className="waiting-message">Waiting for other players to finish...</p>
          <GridDisplay
            grid={gameState.myGrid}
            clues={clues}
            size="medium"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="writing-view">
      <div className="writing-container">
        <div className="writing-header">
          <h1>Write Your Clues</h1>
          {timeLeft !== null && (
            <div className="timer">
              Time: {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <p className="instructions">
          Write a clue for each edge that connects the two keywords on either side of it.
        </p>

        <GridDisplay
          grid={gameState.myGrid}
          clues={clues}
          size="medium"
        />

        <div className="clue-inputs">
          <div className="clue-input-group">
            <label>Top Clue (connects {gameState.myGrid[0]?.keywords.bottom} & {gameState.myGrid[1]?.keywords.bottom})</label>
            <input
              type="text"
              value={clues[0]}
              onChange={(e) => handleClueChange(0, e.target.value)}
              placeholder="Enter clue..."
              maxLength={30}
            />
          </div>

          <div className="clue-input-group">
            <label>Right Clue (connects {gameState.myGrid[1]?.keywords.left} & {gameState.myGrid[3]?.keywords.left})</label>
            <input
              type="text"
              value={clues[1]}
              onChange={(e) => handleClueChange(1, e.target.value)}
              placeholder="Enter clue..."
              maxLength={30}
            />
          </div>

          <div className="clue-input-group">
            <label>Bottom Clue (connects {gameState.myGrid[2]?.keywords.top} & {gameState.myGrid[3]?.keywords.top})</label>
            <input
              type="text"
              value={clues[2]}
              onChange={(e) => handleClueChange(2, e.target.value)}
              placeholder="Enter clue..."
              maxLength={30}
            />
          </div>

          <div className="clue-input-group">
            <label>Left Clue (connects {gameState.myGrid[0]?.keywords.right} & {gameState.myGrid[2]?.keywords.right})</label>
            <input
              type="text"
              value={clues[3]}
              onChange={(e) => handleClueChange(3, e.target.value)}
              placeholder="Enter clue..."
              maxLength={30}
            />
          </div>
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit Clues
        </button>
      </div>
    </div>
  );
}

export default PlayerWritingView;
