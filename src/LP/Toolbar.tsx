import React from 'react';
import { Button as OriginalButton } from 'react-bootstrap';
import { FcCheckmark, FcHighPriority } from 'react-icons/fc';
import styled from 'styled-components';

import { LPHistory } from './Game';

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 65%;
`;

const GameStatus = styled.div`
  display: flex;
  align-items: center;
  width: 16px;
`;

type Props = {
  showResetModal: () => void;
  showLPHistoryModal: () => void;
  showCoinModal: () => void;
  showDiceModal: () => void;
  disabled: boolean;
  lpHistory: LPHistory;
  succeedSave: boolean | undefined;
  lo: () => void;
  undo: () => void;
  redo: () => void;
};

const Button = (
  props: Omit<React.ComponentProps<typeof OriginalButton>, 'variant'>
) => (
  <OriginalButton variant="outline-secondary" {...props}>
    {props.children}
  </OriginalButton>
);

const Toolbar = ({
  showResetModal,
  showLPHistoryModal,
  showCoinModal,
  showDiceModal,
  disabled,
  lpHistory,
  succeedSave,
  lo,
  undo,
  redo,
}: Props) => {
  const disabledUndo = lpHistory.head < 0;
  const disabledRedo = lpHistory.head === lpHistory.logs.length - 1;
  return (
    <Root>
      <Button onClick={showResetModal}>リセット</Button>
      <GameStatus>
        {succeedSave === true && <FcCheckmark />}
        {succeedSave === false && <FcHighPriority />}
      </GameStatus>
      <Button onClick={lo} disabled={disabled}>
        デッキ切れ
      </Button>
      <Button onClick={showCoinModal}>コイン</Button>
      <Button onClick={showDiceModal}>サイコロ</Button>
      <Button onClick={undo} disabled={disabledUndo}>
        戻る
      </Button>
      <Button onClick={redo} disabled={disabledRedo}>
        進む
      </Button>
      <Button onClick={showLPHistoryModal}>ログ</Button>
    </Root>
  );
};

export default Toolbar;
