import { useState } from 'react';
import { Pagination } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import styled from 'styled-components';

import { Deck } from 'lib/result';
import { Media, useMedia } from 'lib/useMedia';

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

const PageNumber = styled.li`
  display: flex;
  align-items: center;
  margin-right: 10px;
  margin-left: 10px;
`;

type Props = {
  decks: Deck[];
  subject: Deck;
  setSubject: (deck: Deck) => void;
};

const Sidebar = ({ decks, subject, setSubject }: Props) => {
  const media = useMedia();
  const [page, setPage] = useState(0);
  const pageSize = (
    {
      [Media.Mobile]: 6,
      [Media.Tablet]: 15,
      [Media.PC]: 20,
    } as const
  )[media];
  const maxPage = Math.ceil(decks.length / pageSize);

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
        <Pagination.Prev
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        />
        <PageNumber>{`${page + 1} / ${maxPage}`}</PageNumber>
        <Pagination.Next
          disabled={page === maxPage - 1}
          onClick={() => setPage((p) => p + 1)}
        />
      </StyledPagination>
    </Root>
  );
};

export default Sidebar;
