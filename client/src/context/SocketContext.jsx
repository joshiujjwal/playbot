import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext();

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [role, setRole] = useState(null); // 'host' | 'player'
  const [gameType, setGameType] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room created (host)
    socket.on('room-created', (data) => {
      console.log('Room created:', data);
      setRoomCode(data.roomCode);
      setRole(data.role);
      setGameType(data.gameType);
      navigate('/host/lobby');
    });

    // Joined room (player)
    socket.on('joined-room', (data) => {
      console.log('Joined room:', data);
      setRoomCode(data.roomCode);
      setRole(data.role);
      setGameType(data.gameType);
      navigate('/player/lobby');
    });

    // Join error
    socket.on('join-error', (data) => {
      console.error('Join error:', data.error);
      setError(data.error);
    });

    // Player joined/left
    socket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      setPlayers(data.players);
    });

    socket.on('player-left', (data) => {
      console.log('Player left:', data);
      setPlayers(data.players);
      if (data.newHost) {
        // Check if we're the new host
        const myPlayer = data.players.find(p => p.id === socket.id);
        if (myPlayer && myPlayer.isHost) {
          setRole('host');
          navigate('/host/lobby');
        }
      }
    });

    // Game started
    socket.on('game-started', (data) => {
      console.log('Game started:', data);
      if (role === 'host') {
        navigate('/host/game');
      } else {
        navigate('/player/game');
      }
    });

    // Game state updates
    socket.on('game-state', (data) => {
      console.log('Game state:', data);
      setGameState(data);
    });

    // Returned to lobby
    socket.on('returned-to-lobby', (data) => {
      console.log('Returned to lobby');
      setPlayers(data.players);
      setGameState(null);
      if (role === 'host') {
        navigate('/host/lobby');
      } else {
        navigate('/player/lobby');
      }
    });

    // Error
    socket.on('error', (data) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });

    // Left room
    socket.on('left-room', () => {
      console.log('Left room');
      setRoomCode(null);
      setRole(null);
      setGameType(null);
      setPlayers([]);
      setGameState(null);
      navigate('/');
    });

    return () => {
      socket.off('room-created');
      socket.off('joined-room');
      socket.off('join-error');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('game-state');
      socket.off('returned-to-lobby');
      socket.off('error');
      socket.off('left-room');
    };
  }, [socket, role, navigate]);

  // API methods
  const createRoom = (gameType = 'so-clover') => {
    if (socket && connected) {
      socket.emit('create-room', { gameType });
    }
  };

  const joinRoom = (roomCode, nickname) => {
    if (socket && connected) {
      setError(null);
      socket.emit('join-room', { roomCode: roomCode.toUpperCase(), nickname });
    }
  };

  const leaveRoom = () => {
    if (socket && connected) {
      socket.emit('leave-room');
    }
  };

  const startGame = () => {
    if (socket && connected && role === 'host') {
      socket.emit('start-game');
    }
  };

  const sendGameInput = (eventType, payload) => {
    if (socket && connected) {
      socket.emit('game-input', { eventType, payload });
    }
  };

  const nextPlayer = () => {
    if (socket && connected && role === 'host') {
      socket.emit('next-player');
    }
  };

  const playAgain = () => {
    if (socket && connected && role === 'host') {
      socket.emit('play-again');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    socket,
    connected,
    roomCode,
    role,
    gameType,
    gameState,
    players,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendGameInput,
    nextPlayer,
    playAgain,
    clearError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
