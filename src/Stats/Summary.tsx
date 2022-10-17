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
  decks: Deck[];
  results: Result[];
};

export const summaryDeck: Deck = {
  id: 0,
  name: "サマリー",
};

const calcSummary = (results: Result[]) => {
  const summary: Record<number, { win: number; lose: number; draw: number }> =
    {};
  results.forEach((result) => {
    const { decks } = result;
    if (!(decks[1] in summary)) {
      summary[decks[1]] = { win: 0, lose: 0, draw: 0 };
    }
    if (!(decks[2] in summary)) {
      summary[decks[2]] = { win: 0, lose: 0, draw: 0 };
    }

    const i = findWinner(result);
    if (i === 0) {
      summary[decks[1]].draw++;
      summary[decks[2]].draw++;
    } else if (i !== null) {
      summary[decks[i]].win++;
      summary[decks[i === 1 ? 2 : 1]].lose++;
    }
  });
  return summary;
};

const Summary = (props: Props) => {
  const { decks, results } = props;
  const summary = calcSummary(results);
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
      <WPChart title="各デッキの勝率" deckNames={deckNames} wp={wp} />
      <NumberChart
        title="各デッキの勝利数・敗北数・引き分け数"
        deckNames={deckNames}
        win={win}
        lose={lose}
        draw={draw}
      />
    </div>
  );
};

export default Summary;
