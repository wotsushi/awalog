import styled from 'styled-components';

import { Deck, ResultChar } from 'lib/result';

import Controller from './Controller';
import { Player, PlayerCtl } from './Game';
import Panel from './Panel';
import Result from './Result';

const Root = styled.div`
  width: 450px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-around;
`;

type Props = {
  decks: Deck[];
  player: Player;
  ctl: PlayerCtl;
  disabled: boolean;
  results: ResultChar[];
};

export const Side1P = (props: Props) => {
  const { player, decks, ctl, results, disabled } = props;
  return (
    <Root data-testid="side-1p">
      <Top>
        <Panel
          decks={decks}
          setDeck={ctl.setDeck}
          toggleFirst={ctl.toggleFirst}
          lp={player.lp}
          isFirst={player.isFirst}
          buf={player.buf}
          mode={player.mode}
        />
        <Result results={results} lo={player.lo} toggleLO={ctl.toggleLO} />
      </Top>
      <Controller
        mode={player.mode}
        addLP={ctl.addLP}
        halfLP={ctl.halfLP}
        changeMode={ctl.changeMode}
        pushKey={ctl.pushKey}
        disabled={disabled}
      />
    </Root>
  );
};

export const Side2P = (props: Props) => {
  const { player, decks, ctl, results, disabled } = props;
  return (
    <Root data-testid="side-2p">
      <Top>
        <Result results={results} lo={player.lo} toggleLO={ctl.toggleLO} />
        <Panel
          decks={decks}
          setDeck={ctl.setDeck}
          toggleFirst={ctl.toggleFirst}
          lp={player.lp}
          isFirst={player.isFirst}
          buf={player.buf}
          mode={player.mode}
        />
      </Top>
      <Controller
        mode={player.mode}
        addLP={ctl.addLP}
        halfLP={ctl.halfLP}
        changeMode={ctl.changeMode}
        pushKey={ctl.pushKey}
        disabled={disabled}
      />
    </Root>
  );
};
