import { useState } from 'react';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';

import AWANav from 'AWANav';
import { useDecks, useResults, useUser } from 'lib/firebase';
import { Deck } from 'lib/result';

import Detail from './Detail';
import Sidebar from './Sidebar';
import Summary, { summaryDeck } from './Summary';

const Content = styled.div`
  display: flex;
`;

const Stats = () => {
  const decks = useDecks();
  const results = useResults();
  const user = useUser();
  const [deck, setDeck] = useState<Deck>(summaryDeck);

  return (
    <>
      <AWANav user={user} />
      <Container>
        <Content>
          <Sidebar decks={decks} selectedDeck={deck} setDeck={setDeck} />
          {deck.name === summaryDeck.name ? (
            <Summary decks={decks} results={results} />
          ) : (
            <Detail results={results} decks={decks} targetDeck={deck} />
          )}
        </Content>
      </Container>
    </>
  );
};

export default Stats;
