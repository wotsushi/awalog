import { User } from 'firebase/auth';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useLogout } from 'lib/firebase';

const StyledNavbar = styled(Navbar)`
  position: sticky;
  top: 0;
`;

type Props = {
  disabledNav?: boolean;
  user: User | undefined;
};

const AWANav = (props: Props) => {
  const logout = useLogout();
  return (
    <StyledNavbar bg="light">
      <Container>
        <Navbar.Brand as={Link} to="/">
          awalog
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/stats" disabled={props.disabledNav}>
              戦績
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/decks" disabled={props.disabledNav}>
              デッキ
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Nav>
          {props.user ? (
            <NavDropdown title={props.user.email}>
              <NavDropdown.Item onClick={logout} disabled={props.disabledNav}>
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
    </StyledNavbar>
  );
};

export default AWANav;
