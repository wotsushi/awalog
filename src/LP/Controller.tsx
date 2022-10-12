import { Button, Col, Container, Row } from "react-bootstrap";
import { Mode } from "./Game";
import "./style.scss";

const quickButtons = [
  [-50, -100, -200],
  [-300, -400, -500],
  [-600, -800, -900],
  [-1000, -2000, -3000],
];

const manualButtons = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["0", "00", "="],
];

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
                  variant="outline-secondary"
                  className="button"
                  size="lg"
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
        <Button
          variant="outline-secondary"
          className="button"
          size="lg"
          onClick={() => props.changeMode("+")}
          disabled={props.disabled}
        >
          +
        </Button>
      </Col>
      <Col>
        <Button
          variant="outline-secondary"
          className="button"
          size="lg"
          onClick={() => props.changeMode("-")}
          disabled={props.disabled}
        >
          -
        </Button>
      </Col>
      <Col>
        <Button
          variant="outline-secondary"
          className="button"
          size="lg"
          onClick={props.halfLP}
          disabled={props.disabled}
        >
          1/2
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
                  variant="outline-secondary"
                  className="button"
                  size="lg"
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
        <Button
          variant={
            props.mode === ("+" as Mode) ? "secondary" : "outline-secondary"
          }
          className="button"
          size="lg"
          onClick={() => props.changeMode("+")}
          disabled={props.disabled}
        >
          +
        </Button>
      </Col>
      <Col>
        <Button
          variant={
            props.mode === ("-" as Mode) ? "secondary" : "outline-secondary"
          }
          className="button"
          size="lg"
          onClick={() => props.changeMode("-")}
          disabled={props.disabled}
        >
          -
        </Button>
      </Col>
      <Col>
        <Button
          variant="outline-secondary"
          className="button"
          size="lg"
          onClick={() => {
            props.changeMode("normal");
          }}
          disabled={props.disabled}
        >
          C
        </Button>
      </Col>
    </Row>
  </Container>
);

const Controller = (props: Props) =>
  props.mode === "normal" ? <Normal {...props} /> : <Manual {...props} />;

export default Controller;
