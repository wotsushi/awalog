import "./style.scss";

import { User } from "firebase/auth";
import { Container } from "react-bootstrap";

import AWANav from "AWANav";
import { useDecks, useSaveResults, useUser } from "lib/firebase";
import { Deck, Result, toResultChars } from "lib/result";

import { useGame } from "./Game";
import { useCoinModal, useDiceModal, useResetModal } from "./modal";
import Side from "./Side";
import Toolbar from "./Toolbar";

type Props = {
  decks: Deck[];
  save: (result: Result) => void;
  user: User | undefined;
};

const Content = (props: Props) => {
  const { decks, save, user } = props;
  const { ResetModal, showResetModal } = useResetModal();
  const { CoinModal, showCoinModal } = useCoinModal();
  const { DiceModal, showDiceModal } = useDiceModal();
  const {
    result,
    player1,
    ctl1,
    player2,
    ctl2,
    disabled,
    lpHistory,
    reset,
    lo,
    undo,
    redo,
    NextGameModal,
    SaveModal,
    LPHistoryModal,
    showLPHistoryModal,
    isPlaying,
  } = useGame(decks, save);

  return (
    <>
      <AWANav disabledStats={isPlaying} user={user} />
      <Container>
        <Toolbar
          showResetModal={showResetModal}
          showLPHistoryModal={showLPHistoryModal}
          showCoinModal={showCoinModal}
          showDiceModal={showDiceModal}
          disabled={disabled || (!player1.lo && !player2.lo)}
          lpHistory={lpHistory}
          lo={lo}
          undo={undo}
          redo={redo}
        />
        <div className="sides">
          <Side
            decks={decks}
            player={player1}
            ctl={ctl1}
            isLeft={true}
            results={toResultChars(result, 1)}
            disabled={disabled || !user}
          />
          <Side
            decks={decks}
            player={player2}
            ctl={ctl2}
            isLeft={false}
            results={toResultChars(result, 2)}
            disabled={disabled || !user}
          />
        </div>
      </Container>
      <NextGameModal />
      <SaveModal />
      <LPHistoryModal />
      <ResetModal reset={reset} />
      <CoinModal />
      <DiceModal />
    </>
  );
};

const LP = () => {
  const decks = useDecks();
  const save = useSaveResults();
  const user = useUser();

  if (decks.length === 0) {
    return null;
  }

  return <Content decks={decks} save={save} user={user} />;
};

export default LP;
