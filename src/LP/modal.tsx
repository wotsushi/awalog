import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

type ResetProps = {
  reset: () => void;
};

export const useResetModal = () => {
  const [showModal, setShowModal] = useState(false);
  const close = () => setShowModal(false);
  const ResetModal = (props: ResetProps) => (
    <Modal show={showModal} onHide={close}>
      <Modal.Header>リセット確認</Modal.Header>
      <Modal.Body>
        新しいマッチ戦を開始してよいですか？ <br /> この操作は取り消しできません
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            props.reset();
            close();
          }}
        >
          はい
        </Button>
        <Button variant="secondary" onClick={close}>
          いいえ
        </Button>
      </Modal.Footer>
    </Modal>
  );
  const showResetModal = () => setShowModal(true);
  return { ResetModal, showResetModal };
};

export const useCoinModal = () => {
  const [showModal, setShowModal] = useState(false);
  const close = () => setShowModal(false);
  const CoinModal = () => {
    const result = Math.random() > 0.5 ? "オモテ" : "ウラ";
    return (
      <Modal show={showModal} onHide={close}>
        <Modal.Header closeButton>コイントス結果</Modal.Header>
        <Modal.Body>{result}が出ました</Modal.Body>
      </Modal>
    );
  };
  const showCoinModal = () => setShowModal(true);
  return { CoinModal, showCoinModal };
};

export const useDiceModal = () => {
  const [showModal, setShowModal] = useState(false);
  const close = () => setShowModal(false);
  const DiceModal = () => {
    const result = 1 + Math.floor(6 * Math.random());
    return (
      <Modal show={showModal} onHide={close}>
        <Modal.Header closeButton>サイコロ結果</Modal.Header>
        <Modal.Body>{result}が出ました</Modal.Body>
      </Modal>
    );
  };
  const showDiceModal = () => setShowModal(true);
  return { DiceModal, showDiceModal };
};
