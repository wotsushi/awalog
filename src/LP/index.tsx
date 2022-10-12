import Body from "./Body";
import "./style.scss";
import { useDecks, useSaveResults, useUser } from "../firebase";

const LP = () => {
  const decks = useDecks();
  const save = useSaveResults();
  const user = useUser();

  if (decks.length === 0) {
    return null;
  }

  return <Body decks={decks} save={save} user={user} />;
};

export default LP;
