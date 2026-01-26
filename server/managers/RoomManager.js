import { Room } from '../classes/Room.js';
import { generateRoomCode, releaseRoomCode } from '../utils/roomCodeGenerator.js';

// RoomManager - manages all active rooms

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> Room
    this.playerToRoom = new Map(); // socketId -> roomCode
  }

  /**
   * Create a new room
   * @param {string} hostId - Socket ID of the host
   * @param {string} gameType - Type of game to create
   * @returns {Room} The created room
   */
  createRoom(hostId, gameType = 'so-clover') {
    const roomCode = generateRoomCode();
    const room = new Room(roomCode, hostId, gameType);

    this.rooms.set(roomCode, room);
    this.playerToRoom.set(hostId, roomCode);

    console.log(`Room ${roomCode} created by ${hostId}`);
    return room;
  }

  /**
   * Get a room by its code
   * @param {string} roomCode - Room code
   * @returns {Room|null} Room object or null
   */
  getRoom(roomCode) {
    return this.rooms.get(roomCode) || null;
  }

  /**
   * Get the room a player is in
   * @param {string} socketId - Socket ID of the player
   * @returns {Room|null} Room object or null
   */
  getRoomByPlayer(socketId) {
    const roomCode = this.playerToRoom.get(socketId);
    return roomCode ? this.getRoom(roomCode) : null;
  }

  /**
   * Join a player to a room
   * @param {string} roomCode - Room code to join
   * @param {string} socketId - Socket ID of the player
   * @param {string} nickname - Player's nickname
   * @returns {Object} Result object with success status and room/error
   */
  joinRoom(roomCode, socketId, nickname) {
    const room = this.getRoom(roomCode);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.state !== 'lobby') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.players.length >= 6) {
      return { success: false, error: 'Room is full' };
    }

    // Check if nickname is already taken
    if (room.players.some(p => p.nickname === nickname)) {
      return { success: false, error: 'Nickname already taken' };
    }

    room.addPlayer(socketId, nickname, false);
    this.playerToRoom.set(socketId, roomCode);

    console.log(`Player ${nickname} (${socketId}) joined room ${roomCode}`);
    return { success: true, room };
  }

  /**
   * Remove a player from their room
   * @param {string} socketId - Socket ID of the player
   * @returns {Object|null} Object with room and wasHost flag, or null
   */
  leaveRoom(socketId) {
    const roomCode = this.playerToRoom.get(socketId);
    if (!roomCode) return null;

    const room = this.getRoom(roomCode);
    if (!room) return null;

    const player = room.getPlayer(socketId);
    const wasHost = player ? player.isHost : false;

    room.removePlayer(socketId);
    this.playerToRoom.delete(socketId);

    console.log(`Player ${socketId} left room ${roomCode}`);

    // If room is empty, delete it
    if (room.isEmpty()) {
      this.deleteRoom(roomCode);
    }

    return { room, wasHost };
  }

  /**
   * Delete a room
   * @param {string} roomCode - Room code to delete
   */
  deleteRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    // Remove all players from tracking
    room.players.forEach(p => {
      this.playerToRoom.delete(p.id);
    });

    this.rooms.delete(roomCode);
    releaseRoomCode(roomCode);

    console.log(`Room ${roomCode} deleted`);
  }

  /**
   * Get all active rooms (for debugging/admin)
   * @returns {Array} Array of room info objects
   */
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => room.getRoomInfo());
  }

  /**
   * Check if a room code exists
   * @param {string} roomCode - Room code to check
   * @returns {boolean} True if room exists
   */
  roomExists(roomCode) {
    return this.rooms.has(roomCode);
  }
}

// Export a singleton instance
export const roomManager = new RoomManager();
