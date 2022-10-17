import { User } from "firebase/auth";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useLogout } from "lib/firebase";

type Props = {
  disabledStats?: boolean;
  user: User | undefined;
};

const AWANav = (props: Props) => {
  const logout = useLogout();
  return (
    <Navbar bg="light">
      <Container>
        <Navbar.Brand as={Link} to="/">
          awalog
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/stats" disabled={props.disabledStats}>
              戦績
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Nav>
          {props.user ? (
            <NavDropdown title={props.user.email}>
              <NavDropdown.Item onClick={logout} disabled={props.disabledStats}>
                ログアウト
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Nav.Link as={Link} to="/login">
              ログイン
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AWANav;
