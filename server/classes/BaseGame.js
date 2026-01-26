// Abstract base class for all games
// Enforces a contract that all game implementations must follow

export class BaseGame {
  constructor(roomCode, players) {
    if (new.target === BaseGame) {
      throw new Error('BaseGame is abstract and cannot be instantiated directly');
    }

    this.roomCode = roomCode;
    this.players = players;
    this.state = {};
  }

  // ABSTRACT METHODS - Must be implemented by subclasses

  /**
   * Initialize game state and start the game
   * Called when host clicks "Start Game"
   */
  start() {
    throw new Error('start() must be implemented by subclass');
  }

  /**
   * Process player input events
   * @param {string} playerId - Socket ID of the player
   * @param {string} eventType - Type of event (e.g., "submit-clues", "submit-vote")
   * @param {Object} data - Event-specific data
   */
  handlePlayerInput(playerId, eventType, data) {
    throw new Error('handlePlayerInput() must be implemented by subclass');
  }

  /**
   * Serialize state for the host (TV display)
   * Should exclude private information like answer keys
   * @returns {Object} Public state for host
   */
  getStateForHost() {
    throw new Error('getStateForHost() must be implemented by subclass');
  }

  /**
   * Serialize state for a specific player
   * Should include player-specific private information
   * @param {string} playerId - Socket ID of the player
   * @returns {Object} Player-specific state
   */
  getStateForPlayer(playerId) {
    throw new Error('getStateForPlayer() must be implemented by subclass');
  }

  /**
   * Check if the game can start
   * @returns {boolean} True if game can start
   */
  canStart() {
    throw new Error('canStart() must be implemented by subclass');
  }

  // CONCRETE METHODS - Available to all games

  /**
   * Get a player by their socket ID
   * @param {string} playerId - Socket ID of the player
   * @returns {Object|null} Player object or null if not found
   */
  getPlayerById(playerId) {
    return this.players.find(p => p.id === playerId) || null;
  }

  /**
   * Get the host player
   * @returns {Object|null} Host player object or null if not found
   */
  getHost() {
    return this.players.find(p => p.isHost) || null;
  }

  /**
   * Broadcast an event to all players in the room
   * @param {Object} io - Socket.io server instance
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  broadcastToRoom(io, eventName, data) {
    io.to(this.roomCode).emit(eventName, data);
  }

  /**
   * Emit an event to the host only
   * @param {Object} io - Socket.io server instance
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  emitToHost(io, eventName, data) {
    const host = this.getHost();
    if (host) {
      io.to(host.id).emit(eventName, data);
    }
  }

  /**
   * Emit an event to a specific player
   * @param {Object} io - Socket.io server instance
   * @param {string} playerId - Socket ID of the player
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  emitToPlayer(io, playerId, eventName, data) {
    io.to(playerId).emit(eventName, data);
  }

  // LIFECYCLE HOOKS - Optional overrides

  /**
   * Called when a new player joins the game
   * @param {Object} player - Player object
   */
  onPlayerJoin(player) {
    // Optional override
  }

  /**
   * Called when a player leaves the game
   * @param {string} playerId - Socket ID of the player who left
   */
  onPlayerLeave(playerId) {
    // Optional override
  }

  /**
   * Called when the host changes (e.g., original host disconnects)
   * @param {string} newHostId - Socket ID of the new host
   */
  onHostChange(newHostId) {
    // Optional override
  }
}
