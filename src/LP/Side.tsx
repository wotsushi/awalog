import { Deck, ResultChar } from "../result";
import Controller from "./Controller";
import { Player, PlayerCtl } from "./Game";
import Window from "./Window";

type Props = {
  decks: Deck[];
  player: Player;
  ctl: PlayerCtl;
  disabled: boolean;
  results: ResultChar[];
  isLeft: boolean;
};

const Side = (props: Props) => {
  const { player, decks, ctl, results, isLeft, disabled } = props;
  return (
    <div className="side">
      <Window
        decks={decks}
        setDeck={ctl.setDeck}
        toggleFirst={ctl.toggleFirst}
        toggleLO={ctl.toggleLO}
        lp={player.lp}
        isFirst={player.isFirst}
        lo={player.lo}
        buf={player.buf}
        mode={player.mode}
        results={results}
        isLeft={isLeft}
      />
      <Controller
        mode={player.mode}
        addLP={ctl.addLP}
        halfLP={ctl.halfLP}
        changeMode={ctl.changeMode}
        pushKey={ctl.pushKey}
        disabled={disabled}
      />
    </div>
  );
};

export default Side;
