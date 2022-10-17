export type Deck = {
  id: number;
  name: string;
}
type Player = {
  lp: number;
  isFirst: boolean;
  lo?: boolean;
}
export type Duel = {1: Player, 2: Player};
export type Result = {decks: {1: number, 2: number}, duels: Duel[], format: 'Single' | 'Match', datetime: string};
export type ResultChar = "W" | "L" | "D";


const winner = (duel: Duel) => {
  if (duel[1].lo && duel[2].lo) {
    return 0;
  }
  if (duel[1].lo) {
    return 2;
  }
  if (duel[2].lo) {
    return 1;
  }
  if (duel[1].lp > 0) {
    return 1;
  }
  else if (duel[2].lp > 0) {
    return 2;
  }
  return 0;
}

export const findWinner = (result: Result) => {
  const { duels } = result;
  if (result.format === 'Single') {
    if (duels.length === 0) {
      return null;
    }
    return winner(duels[0]);
  }
  // Matchの場合
  if (duels.length <= 1) {
    return null;
  }
  const s = result.duels.reduce((res, duel) => {
    const w = winner(duel);
    if (w === 1) {
      return res + 1;
    }
    if (w === 2) {
      return res - 1;
    }
    return res;
  }, 0);
  if (duels.length === 2 && Math.abs(s) <= 1) {
    return null;
  }
  if (s > 0) {
    return 1;
  }
  if (s < 0) {
    return 2;
  }
  return 0;
}

export const toResultChars = (result: Result, i: 1 | 2): ResultChar[] =>
  result.duels.map((duel) => {
    const w = winner(duel);
    if (w === 0) {
      return "D";
    }
    if (w === i) {
      return "W"
    }
    return "L"
  });
