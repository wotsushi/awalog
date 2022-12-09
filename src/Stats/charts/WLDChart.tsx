import { Deck, findWinner, Result } from 'lib/result';
import { Media } from 'lib/useMedia';
import { summaryDeck } from 'Stats/Dashboard';

import PaginationBar from './PaginationBar';
import { DefaultObject } from './util';

const sortChartData = (
  acc: DefaultObject<{ win: number; lose: number; draw: number }>
) => {
  const sorted = Object.entries(acc.data)
    .map(([deckID, { win, lose, draw }]) => ({
      win,
      lose,
      draw,
      sum: win + lose + draw,
      deckID,
    }))
    .sort((a, b) => {
      if (b.sum !== a.sum) {
        return b.sum - a.sum;
      }
      if (b.win !== a.win) {
        return b.win - a.win;
      }
      if (b.lose !== a.lose) {
        return b.lose - a.lose;
      }
      return b.draw - a.draw;
    });
  return {
    deckIDs: sorted.map(({ deckID }) => deckID),
    win: sorted.map(({ win }) => win),
    lose: sorted.map(({ lose }) => lose),
    draw: sorted.map(({ draw }) => draw),
  };
};

const summaryChartData = (results: Result[]) => {
  const acc = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  results
    .filter(({ decks }) => decks[1] !== decks[2])
    .forEach((result) => {
      const { decks } = result;
      const i = findWinner(result);
      if (i === 0) {
        acc.get(decks[1]).draw++;
        acc.get(decks[2]).draw++;
      } else if (i !== null) {
        acc.get(decks[i]).win++;
        acc.get(decks[i === 1 ? 2 : 1]).lose++;
      }
    });
  return sortChartData(acc);
};

const chartData = (results: Result[], subjectID: number) => {
  const acc = new DefaultObject({ win: 0, lose: 0, draw: 0 });
  results
    .filter(
      ({ decks }) =>
        decks[1] !== decks[2] &&
        (decks[1] === subjectID || decks[2] === subjectID)
    )
    .forEach((result) => {
      const { decks } = result;
      const you = decks[1] === subjectID ? 1 : 2;
      const opponent = decks[1] === subjectID ? 2 : 1;
      const i = findWinner(result);
      if (i === 0) {
        acc.get(decks[opponent]).draw++;
      } else if (i === you) {
        acc.get(decks[opponent]).win++;
      } else {
        acc.get(decks[opponent]).lose++;
      }
    });
  return sortChartData(acc);
};

type Props = {
  decks: Deck[];
  results: Result[];
  subjectID: number;
};

const WLDChart = ({ decks, results, subjectID }: Props) => {
  const { deckIDs, win, lose, draw } =
    subjectID === summaryDeck.id
      ? summaryChartData(results)
      : chartData(results, subjectID);
  const labels = deckIDs.map(
    (id) => decks.find((deck) => String(deck.id) === id)?.name
  );
  return (
    <PaginationBar
      pageSizeByMedia={{
        [Media.Mobile]: 15,
        [Media.Tablet]: 30,
        [Media.PC]: 40,
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
            label: '勝利数',
            data: win,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: '敗北数',
            data: lose,
            backgroundColor: 'rgb(255, 99, 132, 0.5)',
          },
          {
            label: '引き分け数',
            data: draw,
            backgroundColor: 'rgb(75, 192, 192, 0.5)',
          },
        ],
      }}
      subjectID={subjectID}
    />
  );
};

export default WLDChart;
