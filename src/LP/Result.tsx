import { Form } from 'react-bootstrap';
import {
  BsCheckCircle,
  BsCircle,
  BsDashCircle,
  BsXCircle,
} from 'react-icons/bs';
import styled from 'styled-components';

import { ResultChar } from 'lib/result';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 130px;
`;

const Icons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type IconProps = {
  result: ResultChar | null;
};

const Icon = ({ result }: IconProps) => {
  if (result === 'W') {
    return <BsCheckCircle size={40} />;
  }
  if (result === 'L') {
    return <BsXCircle size={40} />;
  }
  if (result === 'D') {
    return <BsDashCircle size={40} />;
  }
  return <BsCircle size={40} />;
};

type Props = {
  results: ResultChar[];
  lo: boolean;
  toggleLO: () => void;
};

const Result = ({ results, lo, toggleLO }: Props) => (
  <Root>
    <Icons>
      <Icon result={results.length >= 1 ? results[0] : null} />
      <Icon result={results.length >= 2 ? results[1] : null} />
      <Icon result={results.length >= 3 ? results[2] : null} />
    </Icons>
    <Form.Check
      aria-label="lo"
      checked={lo}
      onChange={toggleLO}
      label="デッキ切れ"
    />
  </Root>
);

export default Result;
