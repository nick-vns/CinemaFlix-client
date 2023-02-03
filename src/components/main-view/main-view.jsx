import { useState } from "react";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";

export const MainView = () => {
  const [movies, setMovies] = useState ([
  {
    id: 1,
    title: "Interstellar",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description: "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable.",
    genre: "Sci-Fi",
    director: "Christopher Nolan"
  },
  {
    id: 2,
    title: "Inglourious Basterds",
    image: "https://m.media-amazon.com/images/M/MV5BOTJiNDEzOWYtMTVjOC00ZjlmLWE0NGMtZmE1OWVmZDQ2OWJhXkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_FMjpg_UX1000_.jpg",
    description: "It is the first year of Germany's occupation of France. Allied officer Lt. Aldo Raine (Brad Pitt) assembles a team of Jewish soldiers to commit violent acts of retribution against the Nazis, including the taking of their scalps.",
    genre: "Action",
    director: "Quentin Tarantino"
  },
  {
    id: 3,
    title: "1408",
    image: "https://m.media-amazon.com/images/M/MV5BMjQ2ODkxMjc4OV5BMl5BanBnXkFtZTgwMTgzNzQyMTI@._V1_FMjpg_UX1000_.jpg",
    description: "Mike Enslin (John Cusack) is a successful author who enjoys worldwide acclaim debunking supernatural phenomena -- before he checks into the Dolphin Hotel, that is.",
    genre: "Horror",
    director: "Mikael Håfström"
  }
  ]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  if (selectedMovie) {
    return (
      <MovieView movie={selectedMovie} onBackClick={() => setSelectedMovie(null)} />
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