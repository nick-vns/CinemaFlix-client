import { useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  ListGroup,
  Container,
} from "react-bootstrap";
import { MovieCard } from "../movie-card/movie-card";
import Stack from "react-bootstrap/Stack";
import moment from "moment";

export const ProfileView = ({ user, movies, favMovies, onLoggedIn }) => {
  const storedToken = localStorage.getItem("token");
  const [token] = useState(storedToken ? storedToken : null);

  const [updateUser, setUpdateUser] = useState(false);
  const [username, updateUsername] = useState(user.Username);
  const [password, updatePassword] = useState("");
  const [email, updateEmail] = useState(user.Email);
  const [birthday, updateBirthday] = useState();

  const moviesData = movies.filter((m) => favMovies.includes(m.id));

  const handleUpdate = (e) => {
    e.preventDefault();

    const data = {
      Username: username,
      Password: password,
      Email: email,
      Birthday: birthday,
    };

    fetch(`https://myflix-app.herokuapp.com/users/${user.Username}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
        onLoggedIn(data.user);
        alert("Account has been updated.");
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        alert("Something went wrong.");
      });
  };

  const handleDeregister = (e) => {
    e.preventDefault();

    fetch(`https://myflix-app.herokuapp.com/users/${user.Username}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert(`${user.Username} successfully deleted.`);
          localStorage.clear();
          window.location.reload();
        } else {
          alert("Something went wrong.");
        }
      })
      .catch((e) => console.log(e));
  };

  let userBirthDate = moment(user.Birthday).format("YYYY/MM/DD");

  return (
    <Container>
      {!updateUser ? (
        <Row className="justify-content-center p-4">
          <Col sm={8} lg={5}>
            <Card
              style={{ minWidth: "15rem", maxWidth: "40rem" }}
              className="shadow-lg p-3 rounded-4 text-center"
              text="secondary"
            >
              <Card.Body>
                <Card.Title>My Account</Card.Title>
                <Card.Text></Card.Text>
              </Card.Body>
              <ListGroup className="text-start">
                <ListGroup.Item className="text-bg-dark">
                  Username: {user.Username}
                </ListGroup.Item>
                <ListGroup.Item className="text-bg-dark">
                  Password: ****
                </ListGroup.Item>
                <ListGroup.Item className="text-bg-dark">
                  Email: {user.Email}
                </ListGroup.Item>
                <ListGroup.Item className="text-bg-dark">
                  Birthday: {userBirthDate}
                </ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <Button variant="primary" onClick={() => setUpdateUser(true)}>
                  EDIT
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row className="justify-content-center p-4">
          <Col sm={6}>
            <Card
              style={{ minWidth: "20rem", maxWidth: "40rem" }}
              className="shadow-lg p-3 rounded-4 text-center"
              text="secondary"
            >
              <Card.Body>
                <Card.Title>Update Account</Card.Title>
                <Card.Text></Card.Text>
                <Form onSubmit={handleUpdate} className="w-100 text-start">
                  <Form.Group controlId="formUsername" className="mb-4">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(event) => updateUsername(event.target.value)}
                      minLength="3"
                      maxLength="10"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formPassword" className="mb-4">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => updatePassword(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formEmail" className="mb-4">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => updateEmail(event.target.value)}
                    />
                    <Form.Text className="text-muted"></Form.Text>
                  </Form.Group>
                  <Form.Group controlId="formBirthday" className="mb-4">
                    <Form.Label>Birthday:</Form.Label>
                    <Form.Control
                      type="date"
                      value={birthday}
                      onChange={(event) => updateBirthday(event.target.value)}
                    />
                  </Form.Group>
                  <Stack gap={2} className="col-md-5 mx-auto">
                    <Button variant="primary" type="submit">
                      SAVE
                    </Button>
                    <Button variant="primary" onClick={handleDeregister}>
                      DELETE
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setUpdateUser(false)}
                    >
                      CANCEL
                    </Button>
                  </Stack>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Row className="justify-content-center py-5">
        <h2 className="text-center mb-5">Favorite Movies</h2>
        {moviesData.length ? (
          moviesData.map((movie) => <MovieCard movie={movie} key={movie.id} />)
        ) : (
          <p>No favorite movies</p>
        )}
      </Row>
    </Container>
  );
};
