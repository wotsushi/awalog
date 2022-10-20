import React, { ReactNode } from 'react';
import { Button as OriginalButton, Col, Container, Row } from 'react-bootstrap';

import { Mode } from './Game';
import './style.scss';

const quickButtons = [
  [-100, -200, -300],
  [-400, -500, -600],
  [-700, -800, -900],
  [-1000, -2000, -3000],
];

const manualButtons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '00', '='],
];

type ButtonProps = {
  onClick: () => void;
  disabled: boolean;
  children?: ReactNode;
};

const Button = ({ onClick, disabled, children }: ButtonProps) => (
  <OriginalButton
    variant="outline-secondary"
    className="button"
    style={{ fontSize: '26px' }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </OriginalButton>
);

type Props = {
  addLP: (lp: number) => void;
  halfLP: () => void;
  mode: Mode;
  changeMode: (mode: Mode) => void;
  pushKey: (key: string) => void;
  disabled: boolean;
};

const Normal = (props: Props) => (
  <Container>
    {quickButtons.map((row, i) => {
      return (
        <Row className="button-row" key={i}>
          {row.map((val, j) => {
            return (
              <Col key={j}>
                <Button
                  onClick={() => props.addLP(val)}
                  disabled={props.disabled}
                >
                  {val}
                </Button>
              </Col>
            );
          })}
        </Row>
      );
    })}
    <Row className="button-row">
      <Col>
        <Button onClick={() => props.changeMode('+')} disabled={props.disabled}>
          ＋
        </Button>
      </Col>
      <Col>
        <Button onClick={() => props.changeMode('-')} disabled={props.disabled}>
          −
        </Button>
      </Col>
      <Col>
        <Button onClick={props.halfLP} disabled={props.disabled}>
          ÷2
        </Button>
      </Col>
    </Row>
  </Container>
);

const Manual = (props: Props) => (
  <Container>
    {manualButtons.map((row, i) => {
      return (
        <Row className="button-row" key={i}>
          {row.map((val, j) => {
            return (
              <Col key={j}>
                <Button
                  onClick={() => props.pushKey(val)}
                  disabled={props.disabled}
                >
                  {val}
                </Button>
              </Col>
            );
          })}
        </Row>
      );
    })}
    <Row className="button-row">
      <Col>
        <Button onClick={() => props.changeMode('+')} disabled={props.disabled}>
          ＋
        </Button>
      </Col>
      <Col>
        <Button onClick={() => props.changeMode('-')} disabled={props.disabled}>
          −
        </Button>
      </Col>
      <Col>
        <Button
          onClick={() => {
            props.changeMode('normal');
          }}
          disabled={props.disabled}
        >
          Ｃ
        </Button>
      </Col>
    </Row>
  </Container>
);

const Controller = (props: Props) =>
  props.mode === 'normal' ? <Normal {...props} /> : <Manual {...props} />;

export default Controller;
