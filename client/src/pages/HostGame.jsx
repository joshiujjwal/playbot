import React from 'react';
import { useSocket } from '../context/SocketContext';
import HostBoard from '../components/games/SoClover/HostBoard';

function HostGame() {
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

  // Route to appropriate game component
  if (gameType === 'so-clover') {
    return <HostBoard gameState={gameState} />;
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
      Unknown game type
    </div>
  );
}

export default HostGame;
