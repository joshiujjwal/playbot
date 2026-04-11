# playbot — TODO

**Type:** Real-time Multiplayer Party Game Platform  
**Stack:** Node.js, Express, Socket.io, React 18, Vite  
**Status:** ~60% complete (core game works; no tests, no persistence, local only)

---

## Actions To Take

- [ ] **Add test suite** — Write Jest/Mocha tests for Socket.io events, game logic (clue/voting/scoring), and player state management; target all game phases of "So Clover!"
- [ ] **Implement room persistence** — Add a database (MongoDB or PostgreSQL) to store room state; implement player rejoin logic so in-progress games survive server restarts and disconnects
- [ ] **Document game abstraction for new games** — Write a `BaseGame` extension guide with a template; implement one additional game type to validate the framework
- [ ] **Add production deployment configuration** — Create Dockerfile and Docker Compose; use environment variables for CORS origins and port configuration; add deployment guide for Railway, Render, or AWS
- [ ] **Implement reconnection and spectator mode** — Handle Socket.io `disconnect`/`reconnect` events to restore player state; add spectator join mode for players who arrive mid-game
