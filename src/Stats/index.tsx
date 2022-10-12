import AWANav from "../AWANav";
import { useDecks, useResults, useUser } from "../firebase";
import Body from "./Body";
import "./style.scss";

const Stats = () => {
  const decks = useDecks();
  const results = useResults();
  const user = useUser();

  return (
    <>
      <AWANav user={user} />
      <Body results={results} decks={decks} />
    </>
  );
};

export default Stats;
