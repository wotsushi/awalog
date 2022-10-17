import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Deck, findWinner, Result } from "lib/result";

import NumberChart from "./NumberChart";
import WPChart from "./WPChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  results: Result[];
  decks: Deck[];
  targetDeck: Deck;
};

const calcStats = (results: Result[], deckID: number) => {
  const summary: Record<string, { win: number; lose: number; draw: number }> =
    {};
  results
    .filter(
      ({ decks }) =>
        (decks[1] === deckID && decks[2] !== deckID) ||
        (decks[1] !== deckID && decks[2] === deckID)
    )
    .forEach((result) => {
      const { decks } = result;
      const you = decks[1] === deckID ? 1 : 2;
      const opponent = decks[1] === deckID ? 2 : 1;
      if (!(decks[opponent] in summary)) {
        summary[decks[opponent]] = { win: 0, lose: 0, draw: 0 };
      }
      const i = findWinner(result);
      if (i === 0) {
        summary[decks[opponent]].draw++;
      } else if (i === you) {
        summary[decks[opponent]].win++;
      } else {
        summary[decks[opponent]].lose++;
      }
    });
  return summary;
};

const Detail = (props: Props) => {
  const { results, decks, targetDeck } = props;
  const summary = calcStats(results, targetDeck.id);
  const deckNames = Object.keys(summary).map(
    (id) => decks.find((deck) => String(deck.id) === id)!.name
  );
  const wp = Object.values(summary).map(
    ({ win, lose, draw }) => (100 * win) / (win + lose + draw)
  );
  const win = Object.values(summary).map(({ win }) => win);
  const lose = Object.values(summary).map(({ lose }) => lose);
  const draw = Object.values(summary).map(({ draw }) => draw);
  return (
    <div className="main">
      <WPChart
        title={`${targetDeck.name}の各デッキに対する勝率`}
        deckNames={deckNames}
        wp={wp}
      />
      <NumberChart
        title={`${targetDeck.name}の各デッキに対する勝利数・敗北数・引き分け数`}
        deckNames={deckNames}
        win={win}
        lose={lose}
        draw={draw}
      />
    </div>
  );
};

export default Detail;
