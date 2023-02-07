import { useEffect, useState } from "react";
import { LoginView } from "../login-view/login-view";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";
import { SignupView } from "../signup-view/signup-view";

export const MainView = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedToken = localStorage.getItem("token");
  const [movies, setMovies] = useState ([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(storedUser? storedUser : null);
  const [token, setToken] = useState(storedToken? storedToken : null);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch("https://myflix-app.herokuapp.com/movies", {
      headers: { Authorization: `Bearer ${token}`}
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
          ImagePath: doc.ImagePath
        };
      });
      setMovies(moviesFromApi);
    });
  }, [token]);

  if (!user) {
    return ( 
      <>
    <LoginView
     onLoggedIn={(user, token) => {
      setUser(user);
      setToken(token);
    }} />
    or
    <SignupView />
    </>
    );
  }
  
  if (selectedMovie) {

    let similarDirector = movies.filter(checkDirector);

    function checkDirector(movie) {
      if (movie.Director.Name === selectedMovie.Director.Name && movie.id !== selectedMovie.id) {
        return true;
      };
    };
    return (
      <>
      <MovieView movie={selectedMovie} onBackClick={() => setSelectedMovie(null)} />
      <hr />
      <h3>Similar Director</h3>
      {similarDirector.length > 0 && 
      <div>
      {similarDirector.map((movie) => (
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
    {similarDirector.length === 0 && 
    <div>No similar directors found.</div>
    }
      </>
    );
  }
  
  if (movies.length === 0) {
    return <div>This list is empty!</div>;
  }
  return (
    <div>
      <button onClick={() => {setUser(null); setToken(null); localStorage.clear(); }}>Logout</button>
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