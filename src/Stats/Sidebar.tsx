import Nav from 'react-bootstrap/Nav';
import styled from 'styled-components';

import { Deck } from 'lib/result';

import { summaryDeck } from './Dashboard';

const Root = styled(Nav)`
  width: 324px;
`;

type Props = {
  decks: Deck[];
  subject: Deck;
  setSubject: (deck: Deck) => void;
};

const Sidebar = ({ decks, subject, setSubject }: Props) => (
  <Root
    variant="pills"
    className="flex-column"
    onSelect={(eventKey: string) => {
      if (eventKey) {
        setSubject(
          decks.find((deck) => String(deck.id) === eventKey) ?? summaryDeck
        );
      }
    }}
    data-testid="sidebar"
  >
    <Nav.Item>
      <Nav.Link
        eventKey={summaryDeck.id}
        active={subject.id === summaryDeck.id}
      >
        サマリー
      </Nav.Link>
    </Nav.Item>
    {decks.map((deck) => (
      <Nav.Item key={deck.id}>
        <Nav.Link eventKey={deck.id} active={subject.id === deck.id}>
          {deck.name}
        </Nav.Link>
      </Nav.Item>
    ))}
  </Root>
);

export default Sidebar;
