import { Bar } from 'react-chartjs-2';

import { Deck, findWinner, Result } from 'lib/result';
import { summaryDeck } from 'Stats/Dashboard';

import { DefaultObject } from './util';

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
  return {
    deckIDs: Object.keys(acc.data),
    win: Object.values(acc.data).map(({ win }) => win),
    lose: Object.values(acc.data).map(({ lose }) => lose),
    draw: Object.values(acc.data).map(({ draw }) => draw),
  };
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
  return {
    deckIDs: Object.keys(acc.data),
    win: Object.values(acc.data).map(({ win }) => win),
    lose: Object.values(acc.data).map(({ lose }) => lose),
    draw: Object.values(acc.data).map(({ draw }) => draw),
  };
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
    <Bar
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
    />
  );
};

export default WLDChart;
