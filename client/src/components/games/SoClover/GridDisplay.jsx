import React from 'react';
import CardDisplay from './CardDisplay';
import './GridDisplay.css';

function GridDisplay({ grid, clues, showClues = true, size = 'medium', onCardClick, selectedCards = {} }) {
  // grid is an array of 4 card configs: [top-left, top-right, bottom-left, bottom-right]
  // clues is [top, right, bottom, left]

  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div className="grid-display">
      <div className="grid-container">
        {/* Top clue */}
        {showClues && clues && (
          <div className="clue clue-top">{clues[0] || '???'}</div>
        )}

        {/* Grid cells */}
        <div className="grid-cells">
          <div className="grid-row">
            <div className="grid-cell">
              {grid[0] && (
                <CardDisplay
                  card={grid[0]}
                  size={size}
                  interactive={!!onCardClick}
                  onClick={() => onCardClick && onCardClick('top-left', grid[0])}
                  selected={selectedCards['top-left'] === grid[0].id}
                />
              )}
            </div>
            <div className="grid-cell">
              {grid[1] && (
                <CardDisplay
                  card={grid[1]}
                  size={size}
                  interactive={!!onCardClick}
                  onClick={() => onCardClick && onCardClick('top-right', grid[1])}
                  selected={selectedCards['top-right'] === grid[1].id}
                />
              )}
            </div>
          </div>
          <div className="grid-row">
            <div className="grid-cell">
              {grid[2] && (
                <CardDisplay
                  card={grid[2]}
                  size={size}
                  interactive={!!onCardClick}
                  onClick={() => onCardClick && onCardClick('bottom-left', grid[2])}
                  selected={selectedCards['bottom-left'] === grid[2].id}
                />
              )}
            </div>
            <div className="grid-cell">
              {grid[3] && (
                <CardDisplay
                  card={grid[3]}
                  size={size}
                  interactive={!!onCardClick}
                  onClick={() => onCardClick && onCardClick('bottom-right', grid[3])}
                  selected={selectedCards['bottom-right'] === grid[3].id}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right clue */}
        {showClues && clues && (
          <div className="clue clue-right">{clues[1] || '???'}</div>
        )}

        {/* Bottom clue */}
        {showClues && clues && (
          <div className="clue clue-bottom">{clues[2] || '???'}</div>
        )}

        {/* Left clue */}
        {showClues && clues && (
          <div className="clue clue-left">{clues[3] || '???'}</div>
        )}
      </div>
    </div>
  );
}

export default GridDisplay;
