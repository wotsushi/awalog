import { useState } from 'react';
import { Pagination } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import styled from 'styled-components';

import { Deck, duelWinner, Result } from 'lib/result';
import { summaryDeck } from 'Stats/Dashboard';

import { DefaultObject } from './util';

const pageSize = 15;

const summaryChartData = (results: Result[], page: number) => {
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

const chartData = (results: Result[], subjectID: number, page: number) => {
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

const ChartPagination = styled(Pagination)`
  justify-content: center;
  margin-top: 10px;
`;

type Props = {
  decks: Deck[];
  results: Result[];
  subjectID: number;
};

const FSChart = ({ decks, results, subjectID }: Props) => {
  const [pages, setPages] = useState([...Array(decks.length + 1)].map(() => 0));
  const page = pages[subjectID];
  const { deckIDs, first, second } =
    subjectID === summaryDeck.id
      ? summaryChartData(results, page)
      : chartData(results, subjectID, page);
  const labels = deckIDs.map(
    (id) => decks.find((deck) => deck.id === id)?.name
  );
  const slice = <T,>(a: T[]) => a.slice(pageSize * page, pageSize * (page + 1));
  return (
    <>
      <Bar
        width={700}
        height={350}
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
          labels: slice(labels),
          datasets: [
            {
              label: '先勝',
              data: slice(first.win),
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              stack: 'first',
            },
            {
              label: '先負',
              data: slice(first.lose),
              backgroundColor: 'rgb(255, 99, 132, 0.5)',
              stack: 'first',
            },
            {
              label: '後勝',
              data: slice(second.win),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              stack: 'second',
            },
            {
              label: '後負',
              data: slice(second.lose),
              backgroundColor: 'rgba(255, 75, 0, 0.5)',
              stack: 'second',
            },
          ],
        }}
      />
      <ChartPagination>
        {[...Array(Math.ceil(deckIDs.length / pageSize))].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i === page}
            onClick={() =>
              setPages(pages.map((page, j) => (j === subjectID ? i : page)))
            }
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </ChartPagination>
    </>
  );
};

export default FSChart;
