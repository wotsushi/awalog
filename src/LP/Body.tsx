import { Container } from "react-bootstrap";
import "./style.scss";
import Toolbar from "./Toolbar";
import { useGame } from "./Game";
import Side from "./Side";
import { useCoinModal, useDiceModal, useResetModal } from "./modal";
import { Deck, Result, toResultChars } from "../result";
import AWANav from "../AWANav";
import { User } from "firebase/auth";

type Props = {
  decks: Deck[];
  save: (result: Result) => void;
  user: User | undefined;
};

const Body = (props: Props) => {
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

export default Body;
