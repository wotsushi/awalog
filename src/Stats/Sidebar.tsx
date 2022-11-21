import { useState } from 'react';
import { Pagination } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import styled from 'styled-components';

import { Deck } from 'lib/result';

import { summaryDeck } from './Dashboard';

const Root = styled.div`
  position: sticky;
  top: 56px;
  width: 170px;
`;

const StyledNav = styled(Nav)`
  height: ${(props) => 40 * (props.pagesize + 1)}px;
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin-top: 10px;
`;

type Props = {
  decks: Deck[];
  subject: Deck;
  setSubject: (deck: Deck) => void;
};

const Sidebar = ({ decks, subject, setSubject }: Props) => {
  const [page, setPage] = useState(0);
  const pageSize = Math.floor((window.innerHeight - 140) / 40);

  return (
    <Root data-testid="sidebar">
      <StyledNav
        className="flex-column"
        pagesize={pageSize}
        variant="pills"
        onSelect={(eventKey: string) => {
          if (eventKey) {
            setSubject(
              decks.find((deck) => String(deck.id) === eventKey) ?? summaryDeck
            );
          }
        }}
      >
        <Nav.Item>
          <Nav.Link
            eventKey={summaryDeck.id}
            active={subject.id === summaryDeck.id}
          >
            サマリー
          </Nav.Link>
        </Nav.Item>
        {decks.slice(pageSize * page, pageSize * (page + 1)).map((deck) => (
          <Nav.Item key={deck.id}>
            <Nav.Link eventKey={deck.id} active={subject.id === deck.id}>
              {deck.name}
            </Nav.Link>
          </Nav.Item>
        ))}
      </StyledNav>
      <StyledPagination>
        {[...Array(Math.ceil(decks.length / pageSize))].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i === page}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </StyledPagination>
    </Root>
  );
};

export default Sidebar;
