import { roomManager } from './RoomManager.js';
import { SoCloverGame } from '../classes/games/SoCloverGame.js';

// SocketManager - handles all socket event routing

export class SocketManager {
  constructor(io) {
    this.io = io;
  }

  /**
   * Initialize socket event handlers
   * @param {Socket} socket - Socket.io socket instance
   */
  initializeSocket(socket) {
    console.log(`Client connected: ${socket.id}`);

    // Room management events
    socket.on('create-room', (data) => this.handleCreateRoom(socket, data));
    socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
    socket.on('leave-room', () => this.handleLeaveRoom(socket));
    socket.on('start-game', () => this.handleStartGame(socket));

    // Game events
    socket.on('game-input', (data) => this.handleGameInput(socket, data));
    socket.on('next-player', () => this.handleNextPlayer(socket));
    socket.on('play-again', () => this.handlePlayAgain(socket));

    // Disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle room creation
   */
  handleCreateRoom(socket, data) {
    const gameType = data?.gameType || 'so-clover';
    const room = roomManager.createRoom(socket.id, gameType);

    // Join the socket.io room
    socket.join(room.roomCode);

    socket.emit('room-created', {
      roomCode: room.roomCode,
      role: 'host',
      gameType: room.gameType
    });

    console.log(`Room ${room.roomCode} created by ${socket.id}`);
  }

  /**
   * Handle player joining a room
   */
  handleJoinRoom(socket, data) {
    const { roomCode, nickname } = data;

    if (!roomCode || !nickname) {
      socket.emit('join-error', { error: 'Room code and nickname required' });
      return;
    }

    const result = roomManager.joinRoom(roomCode, socket.id, nickname);

    if (!result.success) {
      socket.emit('join-error', { error: result.error });
      return;
    }

    const room = result.room;

    // Join the socket.io room
    socket.join(roomCode);

    // Notify the player
    socket.emit('joined-room', {
      success: true,
      roomCode,
      playerId: socket.id,
      role: 'player',
      gameType: room.gameType
    });

    // Notify all players in the room
    this.io.to(roomCode).emit('player-joined', {
      players: room.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        isHost: p.isHost
      }))
    });

    console.log(`Player ${nickname} joined room ${roomCode}`);
  }

  /**
   * Handle player leaving a room
   */
  handleLeaveRoom(socket) {
    const result = roomManager.leaveRoom(socket.id);

    if (!result) return;

    const { room, wasHost } = result;
    socket.leave(room.roomCode);

    // Notify remaining players
    if (!room.isEmpty()) {
      this.io.to(room.roomCode).emit('player-left', {
        players: room.players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          isHost: p.isHost
        })),
        newHost: wasHost ? room.getHost()?.nickname : null
      });
    }

    socket.emit('left-room');
  }

  /**
   * Handle starting the game
   */
  handleStartGame(socket) {
    const room = roomManager.getRoomByPlayer(socket.id);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = room.getPlayer(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    if (room.state !== 'lobby') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    // Create game instance based on game type
    let game;
    if (room.gameType === 'so-clover') {
      game = new SoCloverGame(room.roomCode, room.players);
    } else {
      socket.emit('error', { message: 'Unknown game type' });
      return;
    }

    if (!game.canStart()) {
      socket.emit('error', { message: 'Not enough players to start (need 2-6)' });
      return;
    }

    room.startGame(game);

    // Notify all players
    this.io.to(room.roomCode).emit('game-started', {
      gameType: room.gameType,
      phase: 'writing'
    });

    // Send initial game state to each player
    this.broadcastGameState(room);

    console.log(`Game started in room ${room.roomCode}`);
  }

  /**
   * Handle game input from players
   */
  handleGameInput(socket, data) {
    const room = roomManager.getRoomByPlayer(socket.id);

    if (!room || !room.game) {
      socket.emit('error', { message: 'Not in an active game' });
      return;
    }

    const { eventType, payload } = data;
    room.game.handlePlayerInput(socket.id, eventType, payload);

    // Broadcast updated state
    this.broadcastGameState(room);
  }

  /**
   * Handle moving to next player (after results)
   */
  handleNextPlayer(socket) {
    const room = roomManager.getRoomByPlayer(socket.id);

    if (!room || !room.game) {
      socket.emit('error', { message: 'Not in an active game' });
      return;
    }

    const player = room.getPlayer(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only the host can advance to next player' });
      return;
    }

    if (room.game.state.phase !== 'results') {
      socket.emit('error', { message: 'Can only advance from results phase' });
      return;
    }

    room.game.nextPlayer();
    this.broadcastGameState(room);
  }

  /**
   * Handle play again request
   */
  handlePlayAgain(socket) {
    const room = roomManager.getRoomByPlayer(socket.id);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = room.getPlayer(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only the host can restart the game' });
      return;
    }

    room.resetToLobby();

    this.io.to(room.roomCode).emit('returned-to-lobby', {
      players: room.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        isHost: p.isHost
      }))
    });

    console.log(`Room ${room.roomCode} returned to lobby`);
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.handleLeaveRoom(socket);
  }

  /**
   * Broadcast game state to all players in a room
   */
  broadcastGameState(room) {
    if (!room.game) return;

    // Send host state
    const host = room.getHost();
    if (host) {
      const hostState = room.game.getStateForHost();
      this.io.to(host.id).emit('game-state', hostState);
    }

    // Send individual player states
    room.players.forEach(player => {
      if (!player.isHost) {
        const playerState = room.game.getStateForPlayer(player.id);
        this.io.to(player.id).emit('game-state', playerState);
      }
    });
  }
}
