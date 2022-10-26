import Nav from 'react-bootstrap/Nav';
import styled from 'styled-components';

import { Deck } from 'lib/result';

import { summaryDeck } from './Summary';

const Root = styled(Nav)`
  width: 324px;
`;

type Props = {
  decks: Deck[];
  selectedDeck: Deck;
  setDeck: (deck: Deck) => void;
};

const Sidebar = (props: Props) => {
  const { decks, selectedDeck, setDeck } = props;
  return (
    <Root
      variant="pills"
      className="flex-column"
      onSelect={(eventKey: string) => {
        if (eventKey) {
          setDeck(
            decks.find((deck) => String(deck.id) === eventKey) ?? summaryDeck
          );
        }
      }}
      data-testid="sidebar"
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
    </Root>
  );
};

export default Sidebar;
