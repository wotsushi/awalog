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
      wp: (100 * win) / (win + lose + draw),
      deckID: Number(deckID),
    }))
    .sort((a, b) => {
      if (a.wp !== b.wp) {
        return b.wp - a.wp;
      }
      return a.deckID - b.deckID;
    });
  return {
    deckIDs: sorted.map(({ deckID }) => deckID),
    data: sorted.map(({ wp }) => wp),
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
  results: Result[];
  decks: Deck[];
  subjectID: number;
};

const WPChart = ({ results, decks, subjectID }: Props) => {
  const { deckIDs, data } =
    subjectID === summaryDeck.id
      ? summaryChartData(results)
      : chartData(results, subjectID);
  const labels = deckIDs.map(
    (id) => decks.find((deck) => deck.id === id)?.name
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
          y: {
            title: {
              display: true,
              text: '勝率[%]',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        labels,
        datasets: [
          {
            label: '勝率',
            data,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      }}
      subjectID={subjectID}
    />
  );
};

export default WPChart;
