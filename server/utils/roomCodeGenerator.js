// Generate unique 4-letter room codes
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const usedCodes = new Set();

export function generateRoomCode() {
  let code;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
    attempts++;
  } while (usedCodes.has(code) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique room code');
  }

  usedCodes.add(code);
  return code;
}

export function releaseRoomCode(code) {
  usedCodes.delete(code);
}
