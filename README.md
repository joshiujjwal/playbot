# Playbot - Multiplayer Game Platform

A Jackbox-style multiplayer game platform with strict host/player separation. Currently features "So Clover!" - a word association grid game.

## Features

- **Dual-View Separation**: Host displays on TV, players control from phones
- **Scalable Architecture**: BaseGame class pattern allows adding new games easily
- **So Clover Game**: 2x2 grid word association game with voting mechanics
- **Room System**: 4-letter room codes for easy joining
- **Real-time Updates**: Socket.io for instant synchronization

## Project Structure

```
playbot/
├── server/                 # Node.js + Express + Socket.io backend
│   ├── server.js          # Main server entry point
│   ├── managers/          # Room and socket management
│   ├── classes/           # Game classes (BaseGame, Room, SoCloverGame)
│   ├── data/              # Game data (100 So Clover cards)
│   └── utils/             # Utilities (room codes, state serialization)
├── client/                # React + Vite frontend
│   └── src/
│       ├── context/       # Socket context
│       ├── pages/         # Main pages (Landing, Lobby, Game)
│       └── components/    # Game components
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start the server (in `server/` directory):
```bash
npm run dev
```
Server will run on http://localhost:3001

2. Start the client (in `client/` directory):
```bash
npm run dev
```
Client will run on http://localhost:3000

### How to Play

1. **Host Setup**:
   - Open http://localhost:3000 on a TV/desktop browser
   - Click "Create Room"
   - Share the 4-letter room code with players

2. **Player Join**:
   - Open http://localhost:3000 on your phone/device
   - Click "Join Room"
   - Enter the room code and your nickname

3. **Game Flow**:
   - Host waits for 2-6 players to join
   - Host clicks "Start Game"
   - **Writing Phase**: Each player receives a unique 2x2 grid of cards with keywords. Write one clue for each edge that connects the two keywords on either side.
   - **Voting Phase**: For each player's board (in turn):
     - Other players see the clues and 5 shuffled cards (4 correct + 1 decoy)
     - Vote by placing cards in the grid positions
     - The player whose board it is cannot vote
   - **Scoring**: Majority vote determines placement. Score = correct placements.
   - **Results**: After all players, winner is announced

## Game Rules: So Clover

- **Objective**: Help other players reconstruct your card grid using your clues
- **Writing Phase** (3 minutes):
  - You have a 2x2 grid with 4 cards, each showing 4 keywords
  - Write one clue per edge (4 total) that connects the keywords on either side
  - Example: If "Ocean" and "Blue" are adjacent, clue might be "Water"
- **Voting Phase**:
  - Other players vote on where to place your 4 cards + 1 decoy
  - Majority vote wins for each position
- **Scoring**:
  - 1 point per correct placement by majority
  - Maximum 4 points per round

## Technical Details

### Security

- **Answer Key Protection**: Server uses `StateSerializer` to ensure correct answers never leak to clients during voting
- **Role-Based State**: Host and players receive different views of game state
- **Validation**: Server validates all player inputs and vote submissions

### Architecture Highlights

- **BaseGame Abstract Class**: All games extend this class, ensuring consistent interface
- **Room Management**: Automatic host promotion when host disconnects
- **Socket.io Events**: Real-time bidirectional communication
- **React Context**: Centralized socket and state management

### Adding New Games

1. Create game class extending `BaseGame` in `server/classes/games/`
2. Implement required methods: `start()`, `handlePlayerInput()`, `getStateForHost()`, `getStateForPlayer()`, `canStart()`
3. Add game components in `client/src/components/games/`
4. Update routing in `HostGame.jsx` and `PlayerGame.jsx`

## Dependencies

### Server
- express - Web server
- socket.io - WebSocket communication
- cors - Cross-origin resource sharing

### Client
- react - UI framework
- react-router-dom - Routing
- socket.io-client - WebSocket client
- vite - Build tool

## Development

### Server Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Client Development
```bash
cd client
npm run dev  # Vite hot module replacement
```

### Production Build
```bash
cd client
npm run build
npm run preview
```

## Testing Checklist

- [ ] Room creation and joining
- [ ] 2-6 player games
- [ ] Writing phase with timer
- [ ] All players receive unique grids
- [ ] Voting phase with 5 shuffled cards
- [ ] Current player cannot vote on own board
- [ ] Majority vote calculation
- [ ] Tie handling (no majority = 0 points)
- [ ] Score accumulation
- [ ] Results display
- [ ] Game over with winner
- [ ] Host disconnection (new host promoted)
- [ ] Player disconnection (game continues)
- [ ] Mobile responsiveness
- [ ] Answer key security (no leaks in network tab)

## Known Limitations

- Local network only (no deployment configuration yet)
- Single game type (So Clover only)
- No persistence (rooms lost on server restart)
- No reconnection handling (players must rejoin)

## Future Enhancements

- Add more games (Quiplash-style, Drawful-style, etc.)
- Room persistence with database
- Player reconnection
- Custom card decks
- Spectator mode
- Game statistics and history

## License

MIT

## Credits

Inspired by Jackbox Games' party game platform and the board game "So Clover!" by Repos Production.
