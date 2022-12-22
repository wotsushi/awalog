import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { useAddDeck, useUpdateDeck } from 'lib/firebase';
import { Deck } from 'lib/result';

export const useAddDeckModal = () => {
  const [showModal, setShowModal] = useState(false);
  const addDeck = useAddDeck();
  const close = () => setShowModal(false);

  const DeckModal = () => {
    const [deckName, setDeckName] = useState('');
    return (
      <Modal show={showModal} onHide={close}>
        <Modal.Header>デッキ追加</Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBasicEmail">
            <Form.Control
              type="text"
              onChange={(e) => setDeckName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              addDeck(deckName);
              close();
            }}
          >
            追加
          </Button>
          <Button variant="secondary" onClick={close}>
            キャンセル
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  const showDeckModal = () => setShowModal(true);
  return { DeckModal, showDeckModal };
};

export const useEditDeckModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [prevDeck, setPrevDeck] = useState<Deck>();
  const updateDeck = useUpdateDeck();
  const close = () => setShowModal(false);

  const DeckModal = () => {
    const [deckName, setDeckName] = useState(prevDeck?.name ?? '');
    if (prevDeck === undefined) {
      return null;
    }
    return (
      <Modal show={showModal} onHide={close}>
        <Modal.Header>デッキ編集</Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBasicEmail">
            <Form.Control
              type="text"
              onChange={(e) => setDeckName(e.target.value)}
              value={deckName}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              updateDeck(prevDeck, deckName);
              close();
            }}
          >
            編集
          </Button>
          <Button variant="secondary" onClick={close}>
            キャンセル
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  const showDeckModal = (deck: Deck) => {
    setPrevDeck(deck);
    setShowModal(true);
  };
  return { DeckModal, showDeckModal };
};
