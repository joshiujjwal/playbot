// Room class - manages room lifecycle and player tracking

export class Room {
  constructor(roomCode, hostId, gameType = 'so-clover') {
    this.roomCode = roomCode;
    this.gameType = gameType;
    this.players = [];
    this.game = null;
    this.state = 'lobby'; // 'lobby' | 'playing' | 'finished'

    // Add host as first player
    this.addPlayer(hostId, 'Host', true);
  }

  /**
   * Add a player to the room
   * @param {string} socketId - Socket ID of the player
   * @param {string} nickname - Player's nickname
   * @param {boolean} isHost - Whether this player is the host
   * @returns {Object} Player object
   */
  addPlayer(socketId, nickname, isHost = false) {
    const player = {
      id: socketId,
      nickname,
      isHost,
      score: 0
    };

    this.players.push(player);

    if (this.game && this.game.onPlayerJoin) {
      this.game.onPlayerJoin(player);
    }

    return player;
  }

  /**
   * Remove a player from the room
   * @param {string} socketId - Socket ID of the player to remove
   * @returns {boolean} True if player was removed
   */
  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.id === socketId);
    if (index === -1) return false;

    const wasHost = this.players[index].isHost;
    this.players.splice(index, 1);

    if (this.game && this.game.onPlayerLeave) {
      this.game.onPlayerLeave(socketId);
    }

    // If host left and there are still players, promote the next player
    if (wasHost && this.players.length > 0) {
      this.promoteNewHost();
    }

    return true;
  }

  /**
   * Promote a new host when the current host leaves
   */
  promoteNewHost() {
    if (this.players.length === 0) return;

    const newHost = this.players[0];
    newHost.isHost = true;

    if (this.game && this.game.onHostChange) {
      this.game.onHostChange(newHost.id);
    }
  }

  /**
   * Get a player by their socket ID
   * @param {string} socketId - Socket ID of the player
   * @returns {Object|null} Player object or null
   */
  getPlayer(socketId) {
    return this.players.find(p => p.id === socketId) || null;
  }

  /**
   * Get the host player
   * @returns {Object|null} Host player object or null
   */
  getHost() {
    return this.players.find(p => p.isHost) || null;
  }

  /**
   * Check if room is empty
   * @returns {boolean} True if no players in room
   */
  isEmpty() {
    return this.players.length === 0;
  }

  /**
   * Get room info for lobby display
   * @returns {Object} Room info
   */
  getRoomInfo() {
    return {
      roomCode: this.roomCode,
      gameType: this.gameType,
      state: this.state,
      players: this.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        isHost: p.isHost
      })),
      playerCount: this.players.length
    };
  }

  /**
   * Start the game
   * @param {BaseGame} gameInstance - Game instance to start
   */
  startGame(gameInstance) {
    this.game = gameInstance;
    this.state = 'playing';
    this.game.start();
  }

  /**
   * End the game
   */
  endGame() {
    this.state = 'finished';
  }

  /**
   * Reset room to lobby state
   */
  resetToLobby() {
    this.game = null;
    this.state = 'lobby';
    // Reset player scores
    this.players.forEach(p => {
      p.score = 0;
    });
  }
}
