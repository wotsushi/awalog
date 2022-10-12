import { Button } from "react-bootstrap";
import { LPHistory } from "./Game";
import "./style.scss";

const Reset = (props: { onClick: () => void }) => {
  return (
    <Button variant="outline-secondary" onClick={props.onClick}>
      リセット
    </Button>
  );
};

const LO = (props: { disabled: boolean; onClick: () => void }) => {
  return (
    <Button
      variant="outline-secondary"
      onClick={props.onClick}
      disabled={props.disabled}
      data-testid="lo-button"
    >
      デッキ切れ
    </Button>
  );
};

const Coin = (props: { onClick: () => void }) => {
  return (
    <Button variant="outline-secondary" onClick={props.onClick}>
      コイン
    </Button>
  );
};

const Dice = (props: { onClick: () => void }) => {
  return (
    <Button variant="outline-secondary" onClick={props.onClick}>
      サイコロ
    </Button>
  );
};

const Undo = (props: { lpHistory: LPHistory; undo: () => void }) => (
  <Button
    variant="outline-secondary"
    onClick={props.undo}
    disabled={props.lpHistory.head < 0}
    data-testid="undo"
  >
    戻る
  </Button>
);

const Redo = (props: { lpHistory: LPHistory; redo: () => void }) => (
  <Button
    variant="outline-secondary"
    onClick={props.redo}
    disabled={props.lpHistory.head === props.lpHistory.logs.length - 1}
    data-testid="redo"
  >
    進む
  </Button>
);

const LPLog = (props: Pick<Props, "showLPHistoryModal">) => (
  <Button variant="outline-secondary" onClick={props.showLPHistoryModal}>
    ログ
  </Button>
);

type Props = {
  showResetModal: () => void;
  showLPHistoryModal: () => void;
  showCoinModal: () => void;
  showDiceModal: () => void;
  disabled: boolean;
  lpHistory: LPHistory;
  lo: () => void;
  undo: () => void;
  redo: () => void;
};

const Toolbar = (props: Props) => {
  const {
    showResetModal,
    showLPHistoryModal,
    showCoinModal,
    showDiceModal,
    disabled,
    lpHistory,
    lo,
    undo,
    redo,
  } = props;
  return (
    <div className="toolbar">
      <Reset onClick={showResetModal} />
      <LO disabled={disabled} onClick={lo} />
      <Coin onClick={showCoinModal} />
      <Dice onClick={showDiceModal} />
      <Undo lpHistory={lpHistory} undo={undo} />
      <Redo lpHistory={lpHistory} redo={redo} />
      <LPLog showLPHistoryModal={showLPHistoryModal} />
    </div>
  );
};

export default Toolbar;
