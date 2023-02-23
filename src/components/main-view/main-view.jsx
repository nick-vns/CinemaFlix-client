import { useEffect, useState } from "react";
import { LoginView } from "../login-view/login-view";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";
import { SignupView } from "../signup-view/signup-view";
import { NavigationBar } from "../navigation-bar/navigation-bar";
import { ProfileView } from "../profile-view/profile-view";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export const MainView = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedToken = localStorage.getItem("token");
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(storedUser ? storedUser : null);
  const [token, setToken] = useState(storedToken ? storedToken : null);
  const [searchBar, setSearchBar] = useState("");
  const [searchMovie, setSearchMovie] = useState([]);

  useEffect(() => {
    if (searchBar && searchBar.length > 0) {
      const searchItems = movies.filter(
        (m) =>
          m.Title.toLowerCase().includes(searchBar.toLowerCase().trim()) ||
          m.Director.Name.toLowerCase().includes(searchBar.toLowerCase().trim())
      );
      setSearchMovie(searchItems);
    } else {
      setSearchMovie([]);
    }
  }, [searchBar]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch("https://myflix-app.herokuapp.com/movies", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const moviesFromApi = data.map((doc) => {
          return {
            id: doc._id,
            Title: doc.Title,
            Description: doc.Description,
            Director: doc.Director,
            Genre: doc.Genre,
            Release: doc.Release,
            ImagePath: doc.ImagePath,
          };
        });
        setMovies(moviesFromApi);
      });
  }, [token]);

  return (
    <BrowserRouter>
      <NavigationBar
        user={user}
        token={token}
        onLoggedOut={() => {
          setUser(null);
          setToken(null);
          localStorage.clear();
          <Navigate to="/login" />;
        }}
      />
      <Row className="justify-content-center">
        <Routes>
          <Route
            path="/signup"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5}>
                    <SignupView />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5} className="pt-5">
                    <LoginView
                      onLoggedIn={(user, token) => {
                        setUser(user);
                        setToken(token);
                      }}
                    />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/movies/:movieId"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" replace />
                ) : movies.length === 0 ? (
                  <Col>Loading ...</Col>
                ) : (
                  <Col md={8}>
                    <MovieView movies={movies} />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" replace />
                ) : (
                  <Col>
                    <ProfileView
                      user={user}
                      movies={movies}
                      favMovies={storedUser.FavoriteMovies}
                      onLoggedIn={(user, token) => {
                        setUser(user);
                        setToken(token);
                      }}
                      onLoggedOut={() => {
                        setUser(null);
                        setToken(null);
                        localStorage.clear();
                      }}
                    />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/"
            element={
              <>
                <Row className="justify-content-center m-3">
                  <Col xs={10} sm={6} md={6} lg={5} className="m-auto">
                    <Form className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        value={searchBar}
                        onChange={(e) => setSearchBar(e.target.value)}
                      />
                    </Form>
                  </Col>
                </Row>
                {!user ? (
                  <Navigate to="/login" replace />
                ) : movies.length === 0 ? (
                  <Col>Loading ...</Col>
                ) : (
                  <>
                    {searchMovie && searchMovie.length > 0
                      ? searchMovie.map((movie) => (
                          <Col className="m-auto" md={5} key={movie.id}>
                            <MovieCard movie={movie} />
                          </Col>
                        ))
                      : movies.map((movie) => (
                          <Col className="m-4" key={movie.id} md={5} lg={5}>
                            <MovieCard movie={movie} />
                          </Col>
                        ))}
                  </>
                )}
              </>
            }
          />
        </Routes>
      </Row>
    </BrowserRouter>
  );
};
