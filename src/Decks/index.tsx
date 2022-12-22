import { Button, Container, ListGroup } from 'react-bootstrap';
import styled from 'styled-components';

import AWANav from 'AWANav';
import { useDecks, useUser } from 'lib/firebase';
import { Media, useMedia } from 'lib/useMedia';

import { useAddDeckModal, useEditDeckModal } from './modal';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 5px;
`;

const DeckList = styled.div`
  display: flex;
  margin-top: 10px;
`;

const StyledListGroup = styled(ListGroup)`
  margin-left: ${(props) => (props.$isFirst ? '0' : '20px')};
`;

const Decks = () => {
  const user = useUser();
  const decks = useDecks();
  const media = useMedia();
  const numRows = {
    [Media.Mobile]: 6,
    [Media.Tablet]: 15,
    [Media.PC]: 20,
  }[media];
  const { DeckModal, showDeckModal } = useAddDeckModal();
  const { DeckModal: EditDeckModal, showDeckModal: showEditDeckModal } =
    useEditDeckModal();
  const numColumns = Math.ceil(decks.length / numRows);
  return (
    <>
      <AWANav user={user} />
      <Container>
        <Root>
          <Button onClick={showDeckModal}>追加</Button>
          <DeckList>
            {[...Array(numColumns)].map((_, i) => (
              <StyledListGroup key={i} $isFirst={i === 0}>
                {decks.slice(numRows * i, numRows * (i + 1)).map((deck) => (
                  <ListGroup.Item
                    key={deck.id}
                    onClick={() => showEditDeckModal(deck)}
                  >
                    {deck.name}
                  </ListGroup.Item>
                ))}
              </StyledListGroup>
            ))}
          </DeckList>
        </Root>
      </Container>
      <DeckModal />
      <EditDeckModal />
    </>
  );
};

export default Decks;
