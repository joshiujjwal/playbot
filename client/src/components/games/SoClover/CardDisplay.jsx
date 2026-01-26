import React from 'react';
import './CardDisplay.css';

function CardDisplay({ card, size = 'medium', interactive = false, onClick, selected = false }) {
  if (!card || !card.keywords) return null;

  const sizeClass = size === 'small' ? 'card-small' : size === 'large' ? 'card-large' : 'card-medium';

  return (
    <div
      className={`card-display ${sizeClass} ${interactive ? 'interactive' : ''} ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="keyword keyword-top">{card.keywords.top}</div>
      <div className="keyword keyword-right">{card.keywords.right}</div>
      <div className="keyword keyword-bottom">{card.keywords.bottom}</div>
      <div className="keyword keyword-left">{card.keywords.left}</div>
      <div className="card-center"></div>
    </div>
  );
}

export default CardDisplay;
