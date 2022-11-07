import { Form, ProgressBar } from 'react-bootstrap';
import styled from 'styled-components';

import { Deck } from 'lib/result';

import { Mode } from './Game';

const Root = styled.div`
  width: 250px;
  padding: 10px;
`;

const FirstSwitch = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  font-size: 28px;
`;

const LP = styled.div`
  font-size: 36px;
  text-align: right;
`;

type Props = {
  decks: Deck[];
  setDeck: (deck: Deck) => void;
  toggleFirst: () => void;
  lp: number;
  isFirst: boolean;
  mode: Mode;
  buf: number;
};

const Panel = (props: Props) => {
  const { decks, setDeck, toggleFirst, lp, isFirst, mode, buf } = props;
  const now = Math.floor(lp / 80);
  const variant = (() => {
    if (lp > 4000) {
      return 'success';
    } else if (lp > 2000) {
      return 'warning';
    } else {
      return 'danger';
    }
  })();
  const sign = buf === 0 || mode === 'normal' ? '' : mode;
  return (
    <Root className="bg-light">
      <Form.Select
        size="lg"
        color="bg-light"
        onChange={(e) => setDeck(decks[Number(e.target.value)])}
      >
        {decks.map((deck, i) => (
          <option key={deck.id} value={i}>
            {deck.name}
          </option>
        ))}
      </Form.Select>
      <FirstSwitch>
        <Form.Check
          aria-label="switch"
          type="switch"
          label={isFirst ? '先攻' : '後攻'}
          checked={isFirst}
          onChange={toggleFirst}
        />
      </FirstSwitch>
      <ProgressBar variant={variant} now={now} />
      <LP>{`${lp}${sign}${buf !== 0 ? buf : ''}`}</LP>
    </Root>
  );
};

export default Panel;
