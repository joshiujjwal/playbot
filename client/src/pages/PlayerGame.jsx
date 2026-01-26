import React from 'react';
import { useSocket } from '../context/SocketContext';
import PlayerWritingView from '../components/games/SoClover/PlayerWritingView';
import PlayerVotingView from '../components/games/SoClover/PlayerVotingView';

function PlayerGame() {
  const { gameType, gameState } = useSocket();

  if (!gameState) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading game...
      </div>
    );
  }

  // Route to appropriate game component based on phase
  if (gameType === 'so-clover') {
    if (gameState.phase === 'writing') {
      return <PlayerWritingView gameState={gameState} />;
    } else if (gameState.phase === 'voting') {
      return <PlayerVotingView gameState={gameState} />;
    } else if (gameState.phase === 'results') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Results</h1>
          <p style={{ fontSize: '18px', marginTop: '20px' }}>
            {gameState.currentPlayer} scored {gameState.score}/4
          </p>
          <p style={{ fontSize: '16px', marginTop: '10px', color: '#ddd' }}>
            Waiting for host to continue...
          </p>
        </div>
      );
    } else if (gameState.phase === 'game-over') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Game Over!</h1>
          <div style={{ marginTop: '30px' }}>
            <h2>Final Scores</h2>
            {gameState.finalScores && gameState.finalScores.map((player, index) => (
              <div key={index} style={{
                fontSize: '18px',
                margin: '10px 0',
                fontWeight: player.isMe ? 'bold' : 'normal',
                color: player.isMe ? '#ffeb3b' : 'white'
              }}>
                {index + 1}. {player.nickname}: {player.score} points
              </div>
            ))}
          </div>
          <p style={{ fontSize: '16px', marginTop: '30px', color: '#ddd' }}>
            Waiting for host...
          </p>
        </div>
      );
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      color: 'white',
      fontSize: '24px'
    }}>
      Unknown game state
    </div>
  );
}

export default PlayerGame;
