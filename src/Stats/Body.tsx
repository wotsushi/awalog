import { useState } from "react";
import { Container } from "react-bootstrap";
import { Deck, Result } from "../result";
import Detail from "./Detail";
import Sidebar from "./Sidebar";
import Summary, { summaryDeck } from "./Summary";

type Props = {
  results: Result[];
  decks: Deck[];
};

const Body = (props: Props) => {
  const { results, decks } = props;
  const [deck, setDeck] = useState<Deck>(summaryDeck);
  return (
    <Container>
      <div className="body">
        <Sidebar decks={decks} selectedDeck={deck} setDeck={setDeck} />
        {deck.name === summaryDeck.name ? (
          <Summary decks={decks} results={results} />
        ) : (
          <Detail results={results} decks={decks} targetDeck={deck} />
        )}
      </div>
    </Container>
  );
};

export default Body;
