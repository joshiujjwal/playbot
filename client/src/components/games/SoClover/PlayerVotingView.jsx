import React, { useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import CardDisplay from './CardDisplay';
import './PlayerVotingView.css';

function PlayerVotingView({ gameState }) {
  const { sendGameInput } = useSocket();
  const [selectedCard, setSelectedCard] = useState(null);
  const [placement, setPlacement] = useState({
    'top-left': null,
    'top-right': null,
    'bottom-left': null,
    'bottom-right': null
  });

  // If it's the player's own board
  if (gameState.isMyBoard) {
    return (
      <div className="voting-view">
        <div className="voting-container">
          <h1>Your Board</h1>
          <p className="waiting-message">{gameState.message}</p>
          <div className="clues-display">
            <h3>Your Clues:</h3>
            <div className="clue-list">
              {gameState.clues && gameState.clues.map((clue, idx) => (
                <div key={idx} className="clue-item">
                  <strong>{['Top', 'Right', 'Bottom', 'Left'][idx]}:</strong> {clue || '(empty)'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCardSelect = (card) => {
    setSelectedCard(card.id);
  };

  const handlePositionSelect = (position) => {
    if (!selectedCard) {
      alert('Please select a card first');
      return;
    }

    // Check if card is already placed
    const alreadyPlaced = Object.values(placement).includes(selectedCard);
    if (alreadyPlaced) {
      // Remove it from its current position
      const newPlacement = { ...placement };
      for (const [pos, cardId] of Object.entries(newPlacement)) {
        if (cardId === selectedCard) {
          newPlacement[pos] = null;
        }
      }
      newPlacement[position] = selectedCard;
      setPlacement(newPlacement);
    } else {
      setPlacement({
        ...placement,
        [position]: selectedCard
      });
    }

    setSelectedCard(null);
  };

  const handleSubmit = () => {
    // Check if all positions are filled
    const allFilled = Object.values(placement).every(cardId => cardId !== null);

    if (!allFilled) {
      alert('Please place all cards before submitting');
      return;
    }

    sendGameInput('submit-vote', { placement });
  };

  const getCardForPosition = (position) => {
    const cardId = placement[position];
    if (!cardId) return null;
    return gameState.shuffledCards.find(c => c.id === cardId);
  };

  const isCardPlaced = (cardId) => {
    return Object.values(placement).includes(cardId);
  };

  if (gameState.hasSubmitted) {
    return (
      <div className="voting-view">
        <div className="voting-container">
          <h1>Vote Submitted!</h1>
          <p className="waiting-message">Waiting for other players to vote...</p>
          <div className="grid-preview">
            <h3>Your Vote:</h3>
            <div className="mini-grid">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos, idx) => (
                <div key={pos} className="mini-grid-cell">
                  {getCardForPosition(pos) && (
                    <CardDisplay card={getCardForPosition(pos)} size="small" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-view">
      <div className="voting-container">
        <h1>Vote on {gameState.currentPlayer}'s Board</h1>

        <div className="clues-display">
          <h3>Their Clues:</h3>
          <div className="clue-list">
            {gameState.clues && gameState.clues.map((clue, idx) => (
              <div key={idx} className="clue-item">
                <strong>{['Top', 'Right', 'Bottom', 'Left'][idx]}:</strong> {clue || '(empty)'}
              </div>
            ))}
          </div>
        </div>

        <div className="voting-grid">
          <h3>Place the cards:</h3>
          <div className="grid-positions">
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((position) => (
              <div
                key={position}
                className={`grid-position ${selectedCard ? 'selectable' : ''}`}
                onClick={() => handlePositionSelect(position)}
              >
                <div className="position-label">{position}</div>
                {getCardForPosition(position) ? (
                  <CardDisplay card={getCardForPosition(position)} size="small" />
                ) : (
                  <div className="empty-slot">+</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-selection">
          <h3>Select a card to place:</h3>
          <div className="cards-list">
            {gameState.shuffledCards && gameState.shuffledCards.map((card) => (
              <div key={card.id} className="card-wrapper">
                <CardDisplay
                  card={card}
                  size="small"
                  interactive={!isCardPlaced(card.id)}
                  onClick={() => !isCardPlaced(card.id) && handleCardSelect(card)}
                  selected={selectedCard === card.id}
                />
                {isCardPlaced(card.id) && <div className="placed-overlay">Placed</div>}
              </div>
            ))}
          </div>
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit Vote
        </button>
      </div>
    </div>
  );
}

export default PlayerVotingView;
