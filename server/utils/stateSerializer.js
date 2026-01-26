// Generates role-specific state views to prevent answer key leakage

export class StateSerializer {
  static serializeForHost(gameState) {
    // Host sees public information only - no answer keys during voting
    const { phase, players, currentResolveIndex, shuffledCards, decoyCard } = gameState;

    if (phase === 'lobby') {
      return {
        phase,
        players: players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          isHost: p.isHost
        }))
      };
    }

    if (phase === 'writing') {
      return {
        phase,
        players: players.map(p => ({
          nickname: p.nickname,
          hasSubmitted: p.hasSubmittedClues
        })),
        timer: gameState.timer
      };
    }

    if (phase === 'voting') {
      const currentPlayer = players[currentResolveIndex];
      return {
        phase,
        currentPlayer: currentPlayer.nickname,
        clues: currentPlayer.clues,
        shuffledCards: shuffledCards.map((card, idx) => ({
          id: `card-${idx}`,
          ...card
        })),
        votesReceived: players.filter((p, i) =>
          i !== currentResolveIndex && p.votedPlacement !== null
        ).length,
        votesTotal: players.length - 1,
        players: players.map(p => ({
          nickname: p.nickname,
          score: p.score
        }))
      };
    }

    if (phase === 'results') {
      return {
        phase,
        ...gameState.resultsData,
        players: players.map(p => ({
          nickname: p.nickname,
          score: p.score
        }))
      };
    }

    if (phase === 'game-over') {
      return {
        phase,
        finalScores: players.map(p => ({
          nickname: p.nickname,
          score: p.score
        })).sort((a, b) => b.score - a.score),
        winner: players.reduce((max, p) =>
          p.score > max.score ? p : max, players[0]
        ).nickname
      };
    }

    return { phase };
  }

  static serializeForPlayer(playerId, gameState) {
    const { phase, players, currentResolveIndex, shuffledCards } = gameState;
    const player = players.find(p => p.id === playerId);

    if (!player) {
      return { error: 'Player not found' };
    }

    if (phase === 'lobby') {
      return {
        phase,
        myId: playerId,
        isHost: player.isHost,
        players: players.map(p => ({
          nickname: p.nickname,
          isHost: p.isHost
        }))
      };
    }

    if (phase === 'writing') {
      return {
        phase,
        myGrid: player.gridConfig,
        clues: player.clues,
        hasSubmitted: player.hasSubmittedClues,
        timer: gameState.timer
      };
    }

    if (phase === 'voting') {
      const currentPlayer = players[currentResolveIndex];
      const isMyBoard = player.id === currentPlayer.id;

      if (isMyBoard) {
        return {
          phase,
          isMyBoard: true,
          clues: currentPlayer.clues,
          message: 'Waiting for others to vote on your board...'
        };
      }

      return {
        phase,
        currentPlayer: currentPlayer.nickname,
        clues: currentPlayer.clues,
        shuffledCards: shuffledCards.map((card, idx) => ({
          id: `card-${idx}`,
          ...card
        })),
        myVote: player.votedPlacement,
        hasSubmitted: player.votedPlacement !== null
      };
    }

    if (phase === 'results') {
      return {
        phase,
        ...gameState.resultsData,
        myScore: player.score
      };
    }

    if (phase === 'game-over') {
      return {
        phase,
        finalScores: players.map(p => ({
          nickname: p.nickname,
          score: p.score,
          isMe: p.id === playerId
        })).sort((a, b) => b.score - a.score),
        myScore: player.score
      };
    }

    return { phase };
  }
}
