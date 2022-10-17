import classNames from "classnames";
import Nav from "react-bootstrap/Nav";

import { Deck } from "lib/result";

import { summaryDeck } from "./Summary";

type Props = {
  decks: Deck[];
  selectedDeck: Deck;
  setDeck: (deck: Deck) => void;
};

const Sidebar = (props: Props) => {
  const { decks, selectedDeck, setDeck } = props;
  return (
    <Nav
      variant="pills"
      className={classNames("flex-column", "sidebar")}
      onSelect={(eventKey) => {
        if (eventKey) {
          setDeck(
            decks.find((deck) => String(deck.id) === eventKey) ?? summaryDeck
          );
        }
      }}
    >
      <Nav.Item>
        <Nav.Link
          eventKey={summaryDeck.id}
          active={selectedDeck.id === summaryDeck.id}
        >
          サマリー
        </Nav.Link>
      </Nav.Item>
      {decks.map((deck) => (
        <Nav.Item key={deck.id}>
          <Nav.Link eventKey={deck.id} active={selectedDeck.id === deck.id}>
            {deck.name}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default Sidebar;
