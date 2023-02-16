import PropTypes from "prop-types";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Badge from "react-bootstrap/Badge";
import { useState, useEffect } from "react";
import { BsHeart } from "react-icons/bs";

export const MovieCard = ({ movie }) => {
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [isFavorite, setFavorite] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState(
    storedUser.FavoriteMovies ? storedUser.FavoriteMovies : []
  );

  const addFavoriteMovie = () => {
    fetch(
      `https://myflix-app.herokuapp.com/users/${storedUser.Username}/movies/${movie.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setFavoriteMovies(data.FavoriteMovies);
          localStorage.setItem("user", JSON.stringify(data));
          window.location.reload();
        } else {
          alert("Something went wrong, try again.");
        }
      })
      .catch((err) => console.error(err));
  };

  const deleteFavoriteMovie = () => {
    fetch(
      `https://myflix-app.herokuapp.com/users/${storedUser.Username}/movies/${movie.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setFavoriteMovies(favoriteMovies.filter((fM) => fM !== movie.id));
          localStorage.setItem("user", JSON.stringify(data));
          window.location.reload();
        } else {
          alert("Something went wrong, try again.");
        }
      })
      .catch((err) => console.error(err));
  };

  const toggleFavorite = () => {
    const favoriteMoviesVal = Object.values(favoriteMovies);
    favoriteMoviesVal.some((fM) => fM === movie.id)
      ? setFavorite(true)
      : setFavoriteMovies(false);
  };

  useEffect(() => {
    toggleFavorite();
  }, []);

  return (
    <Card
      style={{ width: "20rem" }}
      className="h-65 m-3 rounded-2 text-center bg-dark text-light p-2"
    >
      <Card.Img
        variant="top"
        src={movie.ImagePath}
        height={420}
        style={{ objectFit: "cover" }}
      />
      <Card.ImgOverlay className="d-flex align-items-start justify-content-between h-75 m-2">
        <Badge bg="info" text="light" style={{ padding: "13px" }}>
          {movie.Release}
        </Badge>
        <Badge bg="none">
          {!isFavorite && (
            <Button variant="outline-info" onClick={addFavoriteMovie}>
              <BsHeart />
            </Button>
          )}
          {isFavorite && (
            <Button onClick={deleteFavoriteMovie} variant="info">
              <BsHeart />
            </Button>
          )}
        </Badge>
      </Card.ImgOverlay>
      <Card.Body>
        <Card.Title>{movie.Title}</Card.Title>
        <Card.Text>Director: {movie.Director.Name}</Card.Text>
        <Card.Text>Genre: {movie.Genre.Name}</Card.Text>
        <Link to={`/movies/${encodeURIComponent(movie.id)}`}>
          <Button variant="info">Details</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string,
    Description: PropTypes.string,
    Director: PropTypes.string,
    Release: PropTypes.string,
    ImagePath: PropTypes.string,
  }).isRequired,
};
