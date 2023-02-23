import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export const NavigationBar = ({ user, movies, onLoggedOut }) => {
  return (
    <Navbar collapseOnSelect sticky="top" expand="md" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          CinemaFlix
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  Log in
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign up
                </Nav.Link>
              </>
            )}
            {user && (
              <>
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  Account
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Nav.Link onClick={onLoggedOut}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
