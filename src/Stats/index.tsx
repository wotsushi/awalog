import { useState } from 'react';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';

import AWANav from 'AWANav';
import { useDecks, useResults, useUser } from 'lib/firebase';
import { Deck } from 'lib/result';

import Dashboard, { summaryDeck } from './Dashboard';
import Sidebar from './Sidebar';

const Content = styled.div`
  display: flex;
`;

const Stats = () => {
  const decks = useDecks();
  const results = useResults();
  const user = useUser();
  const [subject, setSubject] = useState<Deck>(summaryDeck);

  return (
    <>
      <AWANav user={user} />
      <Container>
        <Content>
          <Sidebar decks={decks} subject={subject} setSubject={setSubject} />
          <Dashboard decks={decks} results={results} subject={subject} />
        </Content>
      </Container>
    </>
  );
};

export default Stats;
