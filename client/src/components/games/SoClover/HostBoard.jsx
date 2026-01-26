import React from 'react';
import { useSocket } from '../../../context/SocketContext';
import CardDisplay from './CardDisplay';
import './HostBoard.css';

function HostBoard({ gameState }) {
  const { nextPlayer, playAgain } = useSocket();

  if (!gameState) return null;

  // Writing phase
  if (gameState.phase === 'writing') {
    return (
      <div className="host-board">
        <div className="host-container">
          <h1>Writing Phase</h1>
          <p className="phase-description">Players are writing their clues...</p>

          <div className="players-status">
            {gameState.players && gameState.players.map((player, idx) => (
              <div key={idx} className="player-status-item">
                <span className="player-name">{player.nickname}</span>
                <span className={`status-badge ${player.hasSubmitted ? 'submitted' : 'writing'}`}>
                  {player.hasSubmitted ? 'Submitted' : 'Writing...'}
                </span>
              </div>
            ))}
          </div>

          <div className="timer-display">
            {gameState.timer && (
              <p>Time remaining: {Math.max(0, Math.ceil((gameState.timer.duration - (Date.now() - gameState.timer.startTime)) / 1000))}s</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Voting phase
  if (gameState.phase === 'voting') {
    return (
      <div className="host-board">
        <div className="host-container">
          <h1>Voting on {gameState.currentPlayer}'s Board</h1>

          <div className="clues-display">
            <h2>Clues:</h2>
            <div className="clue-grid">
              <div className="clue-box">
                <strong>Top:</strong> {gameState.clues[0] || '(empty)'}
              </div>
              <div className="clue-box">
                <strong>Right:</strong> {gameState.clues[1] || '(empty)'}
              </div>
              <div className="clue-box">
                <strong>Bottom:</strong> {gameState.clues[2] || '(empty)'}
              </div>
              <div className="clue-box">
                <strong>Left:</strong> {gameState.clues[3] || '(empty)'}
              </div>
            </div>
          </div>

          <div className="cards-display">
            <h2>Available Cards:</h2>
            <div className="cards-row">
              {gameState.shuffledCards && gameState.shuffledCards.map((card) => (
                <CardDisplay key={card.id} card={card} size="medium" />
              ))}
            </div>
          </div>

          <div className="voting-status">
            <h3>Votes: {gameState.votesReceived}/{gameState.votesTotal}</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(gameState.votesReceived / gameState.votesTotal) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  if (gameState.phase === 'results') {
    return (
      <div className="host-board">
        <div className="host-container">
          <h1>Results: {gameState.currentPlayer}</h1>

          <div className="score-display">
            <div className="score-big">
              {gameState.score}/4
            </div>
            <p>Correct Placements</p>
          </div>

          <div className="breakdown">
            <h2>Breakdown:</h2>
            {gameState.breakdown && Object.entries(gameState.breakdown).map(([position, data]) => (
              <div key={position} className={`breakdown-item ${data.correct ? 'correct' : 'incorrect'}`}>
                <strong>{position}:</strong>
                <span>{data.correct ? '✓ Correct' : '✗ Incorrect'}</span>
              </div>
            ))}
          </div>

          <div className="current-scores">
            <h3>Current Scores:</h3>
            {gameState.players && gameState.players.map((player, idx) => (
              <div key={idx} className="score-item">
                <span>{player.nickname}</span>
                <span className="score-value">{player.score}</span>
              </div>
            ))}
          </div>

          <button className="next-button" onClick={nextPlayer}>
            Next Player
          </button>
        </div>
      </div>
    );
  }

  // Game over
  if (gameState.phase === 'game-over') {
    return (
      <div className="host-board">
        <div className="host-container">
          <h1>Game Over!</h1>

          <div className="winner-display">
            <h2>Winner: {gameState.winner}</h2>
          </div>

          <div className="final-scores">
            <h3>Final Scores:</h3>
            {gameState.finalScores && gameState.finalScores.map((player, idx) => (
              <div key={idx} className={`score-item ${idx === 0 ? 'winner' : ''}`}>
                <span className="rank">{idx + 1}.</span>
                <span className="player-name">{player.nickname}</span>
                <span className="score-value">{player.score}</span>
              </div>
            ))}
          </div>

          <button className="play-again-button" onClick={playAgain}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default HostBoard;
