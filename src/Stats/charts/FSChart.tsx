import { Deck, duelWinner, Result } from 'lib/result';
import { Media } from 'lib/useMedia';
import { summaryDeck } from 'Stats/Dashboard';

import PaginationBar from './PaginationBar';
import { DefaultObject } from './util';

const summaryChartData = (results: Result[]) => {
  const deckIDs = new Set<number>();
  const accFirst = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  const accSecond = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  results.forEach((result) => {
    const { decks } = result;
    deckIDs.add(decks[1]);
    deckIDs.add(decks[2]);
    result.duels.forEach((duel) => {
      const first = duel[1].isFirst ? 1 : 2;
      const second = first === 1 ? 2 : 1;
      const w = duelWinner(duel);
      if (w === 0) {
        accFirst.get(decks[first]).draw++;
        accSecond.get(decks[second]).draw++;
      } else if (w === first) {
        accFirst.get(decks[first]).win++;
        accSecond.get(decks[second]).lose++;
      } else {
        accFirst.get(decks[first]).lose++;
        accSecond.get(decks[second]).win++;
      }
    });
  });
  const sortedDeckIDs = Array.from(deckIDs).sort((a, b) => a - b);
  return {
    deckIDs: sortedDeckIDs,
    first: {
      win: sortedDeckIDs.map((deckID) => accFirst.get(deckID).win),
      lose: sortedDeckIDs.map((deckID) => accFirst.get(deckID).lose),
      draw: sortedDeckIDs.map((deckID) => accFirst.get(deckID).draw),
    },
    second: {
      win: sortedDeckIDs.map((deckID) => accSecond.get(deckID).win),
      lose: sortedDeckIDs.map((deckID) => accSecond.get(deckID).lose),
      draw: sortedDeckIDs.map((deckID) => accSecond.get(deckID).draw),
    },
  };
};

const chartData = (results: Result[], subjectID: number) => {
  const deckIDs = new Set<number>();
  const accFirst = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  const accSecond = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  results
    .filter(({ decks }) => decks[1] === subjectID || decks[2] === subjectID)
    .forEach((result) => {
      const { decks } = result;

      // ミラーの場合
      if (decks[1] === decks[2]) {
        deckIDs.add(subjectID);
        result.duels.forEach((duel) => {
          const first = duel[1].isFirst ? 1 : 2;
          const w = duelWinner(duel);
          if (w === 0) {
            accFirst.get(subjectID).draw++;
            accSecond.get(subjectID).draw++;
          } else if (w === first) {
            accFirst.get(subjectID).win++;
            accSecond.get(subjectID).lose++;
          } else {
            accFirst.get(subjectID).lose++;
            accSecond.get(subjectID).win++;
          }
        });
      } else {
        const you = decks[1] === subjectID ? 1 : 2;
        const opponent = you === 1 ? 2 : 1;
        deckIDs.add(decks[opponent]);
        result.duels.forEach((duel) => {
          const isFirst = duel[you].isFirst;
          const w = duelWinner(duel);
          if (w === 0) {
            if (isFirst) {
              accFirst.get(decks[opponent]).draw++;
            } else {
              accSecond.get(decks[opponent]).draw++;
            }
          } else if (w === you) {
            if (isFirst) {
              accFirst.get(decks[opponent]).win++;
            } else {
              accSecond.get(decks[opponent]).win++;
            }
          } else {
            if (isFirst) {
              accFirst.get(decks[opponent]).lose++;
            } else {
              accSecond.get(decks[opponent]).lose++;
            }
          }
        });
      }
    });
  const sortedDeckIDs = Array.from(deckIDs).sort((a, b) => a - b);
  return {
    deckIDs: sortedDeckIDs,
    first: {
      win: sortedDeckIDs.map((deckID) => accFirst.get(deckID).win),
      lose: sortedDeckIDs.map((deckID) => accFirst.get(deckID).lose),
      draw: sortedDeckIDs.map((deckID) => accFirst.get(deckID).draw),
    },
    second: {
      win: sortedDeckIDs.map((deckID) => accSecond.get(deckID).win),
      lose: sortedDeckIDs.map((deckID) => accSecond.get(deckID).lose),
      draw: sortedDeckIDs.map((deckID) => accSecond.get(deckID).draw),
    },
  };
};

type Props = {
  decks: Deck[];
  results: Result[];
  subjectID: number;
};

const FSChart = ({ decks, results, subjectID }: Props) => {
  const { deckIDs, first, second } =
    subjectID === summaryDeck.id
      ? summaryChartData(results)
      : chartData(results, subjectID);
  const labels = deckIDs.map(
    (id) => decks.find((deck) => deck.id === id)?.name
  );
  return (
    <PaginationBar
      pageSizeByMedia={{
        [Media.Mobile]: 8,
        [Media.Tablet]: 15,
        [Media.PC]: 20,
      }}
      decks={decks}
      options={{
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      }}
      data={{
        labels,
        datasets: [
          {
            label: '先勝',
            data: first.win,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            stack: 'first',
          },
          {
            label: '先負',
            data: first.lose,
            backgroundColor: 'rgb(255, 99, 132, 0.5)',
            stack: 'first',
          },
          {
            label: '後勝',
            data: second.win,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            stack: 'second',
          },
          {
            label: '後負',
            data: second.lose,
            backgroundColor: 'rgba(255, 75, 0, 0.5)',
            stack: 'second',
          },
        ],
      }}
      subjectID={subjectID}
    />
  );
};

export default FSChart;
