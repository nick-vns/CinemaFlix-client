import PropTypes from "prop-types";
import "./movie-view.scss";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import { MovieCard } from "../movie-card/movie-card";
import { useEffect } from "react";

export const MovieView = ({ movies, findSimilarMovies }) => {
  const { movieId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const movie = movies.find((m) => m.id === movieId);

  return (
    <div>
      <div>
        <img
          src={movie.ImagePath}
          className="p-2"
          style={{ height: "70%", width: "50%" }}
        />
      </div>
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
      <hr />
      <Row className="justify-content-center py-5">
        <h2 className="text-center mb-5">Similar Directors</h2>
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
