import { BaseGame } from '../BaseGame.js';
import { CARDS, getRotatedKeywords } from '../../data/soCloverCards.js';
import { StateSerializer } from '../../utils/stateSerializer.js';

const ROTATIONS = [0, 90, 180, 270];
const WRITING_TIME_LIMIT = 180000; // 3 minutes in milliseconds

export class SoCloverGame extends BaseGame {
  constructor(roomCode, players) {
    super(roomCode, players);

    this.state = {
      phase: 'lobby',
      currentResolveIndex: 0,
      shuffledCards: [],
      decoyCard: null,
      timer: null,
      resultsData: null
    };

    // Initialize player game data
    this.players.forEach(player => {
      player.gridConfig = [];
      player.clues = ['', '', '', '']; // [top, right, bottom, left]
      player.hasSubmittedClues = false;
      player.votedPlacement = null;
      player.score = 0;
    });
  }

  canStart() {
    return this.players.length >= 2 && this.players.length <= 6;
  }

  start() {
    console.log(`Starting So Clover game in room ${this.roomCode}`);
    this.state.phase = 'writing';
    this.state.currentResolveIndex = 0;

    // Generate random grid config for each player
    this.players.forEach(player => {
      player.gridConfig = this.generateRandomGrid();
      player.clues = ['', '', '', ''];
      player.hasSubmittedClues = false;
      player.votedPlacement = null;
    });

    // Set up timer for writing phase
    this.state.timer = {
      startTime: Date.now(),
      duration: WRITING_TIME_LIMIT
    };

    // Auto-transition after timer expires
    this.writingTimer = setTimeout(() => {
      this.endWritingPhase();
    }, WRITING_TIME_LIMIT);
  }

  /**
   * Generate a random 2x2 grid configuration
   * @returns {Array} Array of 4 card configs with rotation
   */
  generateRandomGrid() {
    // Get 4 unique random cards
    const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 4);

    // Assign random rotations and positions
    return selectedCards.map((card, index) => {
      const rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
      const rotatedKeywords = getRotatedKeywords(card, rotation);

      return {
        cardId: card.id,
        rotation,
        position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'][index],
        keywords: rotatedKeywords
      };
    });
  }

  handlePlayerInput(playerId, eventType, data) {
    switch (eventType) {
      case 'submit-clues':
        this.handleSubmitClues(playerId, data);
        break;
      case 'submit-vote':
        this.handleSubmitVote(playerId, data);
        break;
      default:
        console.warn(`Unknown event type: ${eventType}`);
    }
  }

  /**
   * Handle player submitting their clues
   */
  handleSubmitClues(playerId, data) {
    if (this.state.phase !== 'writing') {
      console.warn('Cannot submit clues outside writing phase');
      return;
    }

    const player = this.getPlayerById(playerId);
    if (!player) return;

    if (player.hasSubmittedClues) {
      console.warn('Player already submitted clues');
      return;
    }

    // Validate clues
    if (!Array.isArray(data.clues) || data.clues.length !== 4) {
      console.warn('Invalid clues format');
      return;
    }

    player.clues = data.clues.map(clue => String(clue).trim());
    player.hasSubmittedClues = true;

    console.log(`Player ${player.nickname} submitted clues`);

    // Check if all players have submitted
    if (this.players.every(p => p.hasSubmittedClues)) {
      this.endWritingPhase();
    }
  }

  /**
   * End the writing phase and transition to voting
   */
  endWritingPhase() {
    // Clear the timer
    if (this.writingTimer) {
      clearTimeout(this.writingTimer);
      this.writingTimer = null;
    }

    // Mark any players who didn't submit as submitted (with empty clues)
    this.players.forEach(p => {
      if (!p.hasSubmittedClues) {
        p.hasSubmittedClues = true;
        p.clues = ['', '', '', ''];
      }
    });

    this.state.phase = 'voting';
    this.state.currentResolveIndex = 0;
    this.prepareVotingForCurrentPlayer();

    console.log('Writing phase ended, starting voting phase');
  }

  /**
   * Prepare voting materials for the current player's board
   */
  prepareVotingForCurrentPlayer() {
    const currentPlayer = this.players[this.state.currentResolveIndex];

    // Get the 4 correct cards
    const correctCards = currentPlayer.gridConfig.map(config => {
      const card = CARDS.find(c => c.id === config.cardId);
      return {
        cardId: card.id,
        rotation: config.rotation,
        keywords: config.keywords
      };
    });

    // Get 1 random decoy card (not in the correct set)
    const usedCardIds = correctCards.map(c => c.cardId);
    const availableCards = CARDS.filter(c => !usedCardIds.includes(c.id));
    const decoyCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    const decoyRotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];

    this.state.decoyCard = {
      cardId: decoyCard.id,
      rotation: decoyRotation,
      keywords: getRotatedKeywords(decoyCard, decoyRotation)
    };

    // Shuffle the 5 cards (4 correct + 1 decoy)
    const allCards = [...correctCards, this.state.decoyCard];
    this.state.shuffledCards = allCards.sort(() => Math.random() - 0.5);

    // Reset votes for all players (except current player)
    this.players.forEach((p, index) => {
      if (index !== this.state.currentResolveIndex) {
        p.votedPlacement = null;
      }
    });
  }

  /**
   * Handle player submitting their vote
   */
  handleSubmitVote(playerId, data) {
    if (this.state.phase !== 'voting') {
      console.warn('Cannot submit vote outside voting phase');
      return;
    }

    const player = this.getPlayerById(playerId);
    if (!player) return;

    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === this.state.currentResolveIndex) {
      console.warn('Current player cannot vote on their own board');
      return;
    }

    if (player.votedPlacement !== null) {
      console.warn('Player already voted');
      return;
    }

    // Validate placement format
    // Expected: { "top-left": "card-0", "top-right": "card-1", ... }
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    if (!data.placement || typeof data.placement !== 'object') {
      console.warn('Invalid placement format');
      return;
    }

    for (const pos of positions) {
      if (!data.placement[pos] || !data.placement[pos].startsWith('card-')) {
        console.warn(`Missing or invalid placement for ${pos}`);
        return;
      }
    }

    player.votedPlacement = data.placement;
    console.log(`Player ${player.nickname} submitted vote`);

    // Check if all voters have voted
    const expectedVoters = this.players.length - 1; // Everyone except current player
    const actualVotes = this.players.filter((p, i) =>
      i !== this.state.currentResolveIndex && p.votedPlacement !== null
    ).length;

    if (actualVotes >= expectedVoters) {
      this.calculateVotingResults();
    }
  }

  /**
   * Calculate majority vote and score
   */
  calculateVotingResults() {
    const currentPlayer = this.players[this.state.currentResolveIndex];
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    // Get correct answer
    const correctAnswer = {};
    currentPlayer.gridConfig.forEach(config => {
      // Find the card index in shuffledCards
      const cardIndex = this.state.shuffledCards.findIndex(
        c => c.cardId === config.cardId && c.rotation === config.rotation
      );
      correctAnswer[config.position] = `card-${cardIndex}`;
    });

    // Count votes for each position
    const voteCounts = {};
    positions.forEach(pos => {
      voteCounts[pos] = {};
    });

    this.players.forEach((p, index) => {
      if (index !== this.state.currentResolveIndex && p.votedPlacement) {
        positions.forEach(pos => {
          const vote = p.votedPlacement[pos];
          voteCounts[pos][vote] = (voteCounts[pos][vote] || 0) + 1;
        });
      }
    });

    // Calculate majority for each position
    const majorityVote = {};
    const breakdown = {};
    let score = 0;

    positions.forEach(pos => {
      const votes = voteCounts[pos];
      let maxVotes = 0;
      let majority = null;

      for (const [cardId, count] of Object.entries(votes)) {
        if (count > maxVotes) {
          maxVotes = count;
          majority = cardId;
        } else if (count === maxVotes) {
          // Tie - no majority
          majority = null;
        }
      }

      majorityVote[pos] = majority;
      const isCorrect = majority === correctAnswer[pos];

      breakdown[pos] = {
        majority,
        correct: isCorrect,
        correctAnswer: correctAnswer[pos],
        votes: votes
      };

      if (isCorrect && majority !== null) {
        score++;
      }
    });

    // Update player score
    currentPlayer.score += score;

    // Store results
    this.state.resultsData = {
      currentPlayer: currentPlayer.nickname,
      clues: currentPlayer.clues,
      correctAnswer,
      majorityVote,
      breakdown,
      score,
      totalScore: currentPlayer.score
    };

    this.state.phase = 'results';
    console.log(`Voting results: ${currentPlayer.nickname} scored ${score}/4`);
  }

  /**
   * Move to next player or end game
   */
  nextPlayer() {
    this.state.currentResolveIndex++;

    if (this.state.currentResolveIndex >= this.players.length) {
      // All players done - game over
      this.endGame();
    } else {
      // Move to next player
      this.state.phase = 'voting';
      this.prepareVotingForCurrentPlayer();
    }
  }

  /**
   * End the game
   */
  endGame() {
    this.state.phase = 'game-over';
    console.log(`Game over in room ${this.roomCode}`);
  }

  getStateForHost() {
    return StateSerializer.serializeForHost(this.state);
  }

  getStateForPlayer(playerId) {
    return StateSerializer.serializeForPlayer(playerId, {
      ...this.state,
      players: this.players
    });
  }

  onPlayerLeave(playerId) {
    console.log(`Player ${playerId} left during game`);
    // Game continues without the player
    // If they were the current player being voted on, skip to next
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === this.state.currentResolveIndex && this.state.phase === 'voting') {
      this.nextPlayer();
    }
  }
}
