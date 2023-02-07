import { useEffect, useState } from "react";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";

export const MainView = () => {
  const [movies, setMovies] = useState ([]);

  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetch("https://myflix-app.herokuapp.com/movies")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const moviesFromApi = data.map((doc) => {
        return {
          id: doc._id,
          Title: doc.Title,
          Description: doc.Description,
          Director: doc.Director,
          Genre: doc.Genre,
          Release: doc.Release,
          ImagePath: doc.ImagePath
        };
      });
      setMovies(moviesFromApi);
    });
  }, []);
  
  if (selectedMovie) {

    let similarMovie = movies.filter(checkGenre);
    function checkGenre(movie) {
      if (movie.Genre.Name === selectedMovie.Genre.Name && movie.id !== selectedMovie.id) {
        return true;
      };
    };
    return (
      <>
      <MovieView movie={selectedMovie} onBackClick={() => setSelectedMovie(null)} />
      <hr />
      <h3>Similar Movies</h3>
      {similarMovie.length > 0 && 
      <div>
      {similarMovie.map((movie) => (
        <MovieCard
        key = {movie.id}
        movie = {movie}
        onMovieClick = {(newSelectedMovie) => {
          setSelectedMovie(newSelectedMovie);
          }}
        />
      ))}
      </div> 
    }
    {similarMovie.length === 0 && 
    <div>No similar movies found.</div>
    }
      </>
    );
  }

  if (movies.length === 0) {
    return <div>This list is empty!</div>;
  }
  return (
    <div>
      {movies.map((movie) => (
        <MovieCard 
          key={movie.id}
          movie={movie}
          onMovieClick={(newSelectedMovie) => {
            setSelectedMovie(newSelectedMovie);
          }}
          />
      ))}
    </div>
  );
};