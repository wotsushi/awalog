import { findWinner } from "lib/result";

describe('findWinner', () => {
  const defaultFindWinner = (format: "Single" | "Match") => (duels: [number, number][]) => findWinner({
    decks: {1: 1, 2: 2},
    duels: duels.map(([lp1, lp2]) => ({1: {lp: lp1, isFirst: true}, 2: {lp: lp2, isFirst: false}})),
    format,
    datetime: "2022-09-23 08:45",
  })
  const findSingleWinner = defaultFindWinner("Single");
  const findMatchWinner = defaultFindWinner("Match");
  describe('シングル', () => {
    it('デュエルが行われていない場合はnull', () => {
      const winner = findSingleWinner([]);
      expect(winner).toBeNull();
    });
    it('2番目のプレイヤーのみLPが0ならば1番目のプレイヤーの勝利', () => {
      const winner = findSingleWinner([[1000, 0]]);
      expect(winner).toEqual(1);
    });
    it('1番目のプレイヤーのみLPが0ならば2番目のプレイヤーの勝利', () => {
      const winner = findSingleWinner([[0, 2000]]);
      expect(winner).toEqual(2);
    });
    it('お互いのLPが0ならば引き分け', () => {
      const winner = findSingleWinner([[0, 0]]);
      expect(winner).toEqual(0);
    });
  });
  describe('マッチ: 結果が未定(null)のパターン', () => {
    it('デュエルが行われていない場合はnull', () => {
      const winner = findMatchWinner([]);
      expect(winner).toBeNull();
    });
    it('1戦しかデュエルしていない場合はnull', () => {
      const winner = findMatchWinner([[1000, 0]]);
      expect(winner).toBeNull();
    });
    it('ox-のマッチはnull', () => {
      const winner = findMatchWinner([[1000, 0], [0, 2000]]);
      expect(winner).toBeNull();
    });
    it('od-のマッチはnull', () => {
      const winner = findMatchWinner([[1000, 0], [0, 0]]);
      expect(winner).toBeNull();
    });
    it('dd-のマッチはnull', () => {
      const winner = findMatchWinner([[0, 0], [0, 0]]);
      expect(winner).toBeNull();
    });
  })
  describe('マッチ: 1番目のプレイヤーが勝利のパターン', () => {
    it('oo-のマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[1000, 0], [2000, 0]]);
      expect(winner).toEqual(1)
    });
    it('oxoのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[1000, 0], [0, 2000], [3000, 0]]);
      expect(winner).toEqual(1)
    });
    it('xooのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 2000], [1000, 0], [3000, 0]]);
      expect(winner).toEqual(1)
    });
    it('odoのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[1000, 0], [0, 0], [3000, 0]]);
      expect(winner).toEqual(1)
    });
    it('oddのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[1000, 0], [0, 0], [0, 0]]);
      expect(winner).toEqual(1)
    });
    it('dooのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [1000, 0], [3000, 0]]);
      expect(winner).toEqual(1)
    });
    it('dodのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [1000, 0], [0, 0]]);
      expect(winner).toEqual(1)
    });
    it('ddoのマッチは1番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [0, 0], [1000, 0]]);
      expect(winner).toEqual(1)
    });
  });
  describe('マッチ: 2番目のプレイヤーが勝利のパターン', () => {
    it('xx-のマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 1000], [0, 2000]]);
      expect(winner).toEqual(2)
    });
    it('xoxのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 1000], [2000, 0], [0, 3000]]);
      expect(winner).toEqual(2)
    });
    it('oxxのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[2000, 0], [0, 1000], [0, 3000]]);
      expect(winner).toEqual(2)
    });
    it('xdxのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 1000], [0, 0], [0, 3000]]);
      expect(winner).toEqual(2)
    });
    it('xddのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 1000], [0, 0], [0, 0]]);
      expect(winner).toEqual(2)
    });
    it('dxxのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [0, 1000], [0, 3000]]);
      expect(winner).toEqual(2)
    });
    it('dxdのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [0, 1000], [0, 0]]);
      expect(winner).toEqual(2)
    });
    it('ddxのマッチは2番目のプレイヤーの勝利', () => {
      const winner = findMatchWinner([[0, 0], [0, 0], [0, 2000]]);
      expect(winner).toEqual(2)
    });
  });
  describe('マッチ: 引き分けのパターン', () => {
    it('dddのマッチは引き分け', () => {
      const winner = findMatchWinner([[0, 0], [0, 0], [0, 0]]);
      expect(winner).toEqual(0)
    });
    it('oxdのマッチは引き分け', () => {
      const winner = findMatchWinner([[1000, 0], [0, 2000], [0, 0]]);
      expect(winner).toEqual(0)
    });
    it('xodのマッチは引き分け', () => {
      const winner = findMatchWinner([[0, 2000], [1000, 0], [0, 0]]);
      expect(winner).toEqual(0)
    });
    it('odxのマッチは引き分け', () => {
      const winner = findMatchWinner([[2000, 0], [0, 0], [0, 3000]]);
      expect(winner).toEqual(0)
    });
    it('xdoのマッチは引き分け', () => {
      const winner = findMatchWinner([[0, 3000], [0, 0], [2000, 0]]);
      expect(winner).toEqual(0)
    });
    it('doxのマッチは引き分け', () => {
      const winner = findMatchWinner([[0, 0], [2000, 0], [0, 3000]]);
      expect(winner).toEqual(0)
    });
    it('dxoのマッチは引き分け', () => {
      const winner = findMatchWinner([[0, 0], [0, 3000], [2000, 0]]);
      expect(winner).toEqual(0)
    });
  });
});
