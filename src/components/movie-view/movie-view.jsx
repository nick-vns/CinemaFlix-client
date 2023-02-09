import PropTypes from "prop-types";
import "./movie-view.scss";
import Button from "react-bootstrap/Button";

export const MovieView = ({ movie, onBackClick }) => {
  return (
    <div>
      <div>
        <img src={movie.ImagePath} />
      </div>
      <div>
        <span>Title: </span>
        <span>{movie.Title}</span>
      </div>
      <div>
        <span>Description: </span>
        <span>{movie.Description}</span>
      </div>
      <div>
        <span>Genre: </span>
        <span>{movie.Genre.Name}</span>
      </div>
      <div>
      <span>Director: </span>
      <span>{movie.Director.Name}</span>
    </div>
    <div>
      <span>Release: </span>
      <span>{movie.Release}</span>
    </div>
    <Button onClick={onBackClick}>Back</Button>
    </div>
  );
};

MovieView.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string,
    Description: PropTypes.string,
    Genre: PropTypes.shape({
      Name: PropTypes.string,
      Description: PropTypes.string
    }).isRequired,
    Director: PropTypes.shape({
      Name: PropTypes.string,
      Bio: PropTypes.string
    }).isRequired,
    Release: PropTypes.string
  }).isRequired,
};