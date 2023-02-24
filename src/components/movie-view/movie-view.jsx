import { MovieCard } from "../movie-card/movie-card";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Row, Card } from "react-bootstrap";

export const MovieView = ({ movies }) => {
  const { movieId } = useParams();
  const movie = movies.find((m) => m.id === movieId);

  const findSimilarMovies = (Director, id) =>
    movies.filter(
      (movie) => movie.Director.Name === Director && movie.id !== id
    );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <div>
        <img
          src={movie.ImagePath}
          className="p-2"
          style={{ height: "70%", width: "50%" }}
        />
      </div>
      <Card border="dark" className="bg-light bg-opacity-75 shadow rounded-2">
        <Card.Body>
          <div>
            <h1>{movie.Title}</h1>
          </div>
          <p>{movie.Description}</p>
          <div>
            <strong>Director: </strong>
            <span>{movie.Director.Name}</span>
          </div>
          <div>
            <strong>Genre: </strong>
            <span>{movie.Genre.Name}</span>
          </div>
          <p>
            <strong>Release: </strong>
            <span>{movie.Release}</span>
          </p>
          <Link to={`/`}>
            <Button className="primary">Back</Button>
          </Link>
        </Card.Body>
      </Card>
      <hr />
      <Row className="justify-content-center py-5 m-1">
        <Card
          className="bg-dark  rounded-5 shadow"
          border="light"
          style={{ width: "18rem", height: "5rem" }}
        >
          <Card.Body>
            <h3 className="text-center mb-5" style={{ color: "beige" }}>
              Same Directors
            </h3>
          </Card.Body>
        </Card>
      </Row>
      <Row>
        {findSimilarMovies(movie.Director.Name, movie.id).map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </Row>
    </div>
  );
};

MovieView.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string,
    Description: PropTypes.string,
    Genre: PropTypes.shape({
      Name: PropTypes.string,
      Description: PropTypes.string,
    }).isRequired,
    Director: PropTypes.shape({
      Name: PropTypes.string,
      Bio: PropTypes.string,
    }).isRequired,
    Release: PropTypes.string,
  }).isRequired,
};
