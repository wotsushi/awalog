import { User } from 'firebase/auth';
import { useState } from 'react';
import { Container } from 'react-bootstrap';

import AWANav from 'AWANav';
import { useDecks, useResults, useUser } from 'lib/firebase';
import { Deck, Result } from 'lib/result';

import Detail from './Detail';
import Sidebar from './Sidebar';
import Summary, { summaryDeck } from './Summary';
import './style.scss';

type Props = {
  results: Result[];
  decks: Deck[];
  user: User | undefined;
};

const Content = ({ results, decks, user }: Props) => {
  const [deck, setDeck] = useState<Deck>(summaryDeck);
  return (
    <>
      <AWANav user={user} />
      <Container>
        <div className="body" data-testid="content">
          <Sidebar decks={decks} selectedDeck={deck} setDeck={setDeck} />
          {deck.name === summaryDeck.name ? (
            <Summary decks={decks} results={results} />
          ) : (
            <Detail results={results} decks={decks} targetDeck={deck} />
          )}
        </div>
      </Container>
    </>
  );
};

const Stats = () => {
  const decks = useDecks();
  const results = useResults();
  const user = useUser();

  return <Content results={results} decks={decks} user={user} />;
};

export default Stats;
