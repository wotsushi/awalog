import { Form, ProgressBar } from "react-bootstrap";
import { Mode } from "./Game";
import {
  BsCheckCircle,
  BsCircle,
  BsDashCircle,
  BsXCircle,
} from "react-icons/bs";

import { Deck, ResultChar } from "../result";

type Props = {
  decks: Deck[];
  setDeck: (deck: Deck) => void;
  toggleFirst: () => void;
  toggleLO: () => void;
  lp: number;
  isFirst: boolean;
  lo: boolean;
  mode: Mode;
  buf: number;
  isLeft: boolean;
  results: ResultChar[];
};

const ResultIcon = ({ result }: { result: ResultChar | null }) => {
  const size = 40;
  const Icon = (() => {
    if (result === "W") {
      return BsCheckCircle;
    }
    if (result === "L") {
      return BsXCircle;
    }
    if (result === "D") {
      return BsDashCircle;
    }
    return BsCircle;
  })();
  return <Icon size={size} />;
};

const Window = (props: Props) => {
  const {
    decks,
    setDeck,
    toggleFirst,
    toggleLO,
    lp,
    isFirst,
    lo,
    mode,
    buf,
    isLeft,
    results,
  } = props;
  const now = Math.floor(lp / 80);
  const variant = (() => {
    if (lp > 4000) {
      return "success";
    } else if (lp > 2000) {
      return "warning";
    } else {
      return "danger";
    }
  })();
  const sign = buf === 0 || mode === "normal" ? "" : mode;
  const testID = isLeft ? "1p" : "2p";
  const LPResult = (
    <div className="right-window">
      <div className={isLeft ? "lp-result-left" : "lp-result-right"}>
        <ResultIcon result={results.length >= 1 ? results[0] : null} />
        <ResultIcon result={results.length >= 2 ? results[1] : null} />
        <ResultIcon result={results.length >= 3 ? results[2] : null} />
      </div>
      <Form.Check
        checked={lo}
        onChange={toggleLO}
        label="デッキ切れ"
        data-testid={`window-lo-${testID}`}
      />
    </div>
  );
  return (
    <div className={isLeft ? "lp-box-left" : "lp-box-right"}>
      {!isLeft && LPResult}
      <div className="lp-parent bg-light text-black">
        <Form.Select
          size="lg"
          color="bg-light"
          className="deck-selector"
          onChange={(e) => setDeck(decks[Number(e.target.value)])}
          data-testid={`window-deck-${testID}`}
        >
          {decks.map((deck, i) => (
            <option key={deck.id} value={i}>
              {deck.name}
            </option>
          ))}
        </Form.Select>
        <div className="firstSwitch" data-testid={`window-first-${testID}`}>
          <Form.Check
            type="switch"
            label={isFirst ? "先攻" : "後攻"}
            checked={isFirst}
            onChange={toggleFirst}
            data-testid={`window-first-switch-${testID}`}
          />
        </div>
        <ProgressBar variant={variant} now={now}></ProgressBar>
        <div className="lp" data-testid={`window-lp-${testID}`}>{`${lp}${sign}${
          buf !== 0 ? buf : ""
        }`}</div>
      </div>
      {isLeft && LPResult}
    </div>
  );
};

export default Window;
