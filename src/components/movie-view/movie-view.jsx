import React from "react";
import { movieGenres, movieRating, releaseYear } from "../../catalog.mjs";
import { FavoriteButton, Poster } from "../movie-card/movie-card.jsx";

export function MovieView({ movie, Link, ...favorite }) {
  const genres = movieGenres(movie);
  const rating = movieRating(movie);
  const release = movie.ReleaseDate ?? movie.Release;
  const year = releaseYear(movie);
  const runtime = Number.isFinite(movie.Runtime) ? movie.Runtime + " min" : undefined;
  const summary = [year, runtime, ...genres].filter(Boolean);
  const facts = [
    ["Director", movie.Director?.Name],
    ["Cast", movie.Actors?.length ? movie.Actors.join(", ") : undefined],
    ["Release date", ["number", "string"].includes(typeof release) ? release : undefined],
    [movie.tmdbId ? "TMDB rating" : "Rating", rating ? <>
      {rating}{movie.VoteCount > 0 && " · " + movie.VoteCount.toLocaleString() + " votes"}
    </> : undefined],
    ["Director biography", movie.Director?.Bio],
    ["About the genre", movie.Genre?.Description],
  ].filter(([, value]) => value);

  return (
    <div className="detail-page">
      <Link className="back-link" href="/">Back to Explore</Link>
      <article className="details">
        <div className="detail-media"><Poster key={movie._id} movie={movie} eager backdrop /></div>
        <div className="detail-content">
          <h1>{movie.Title}</h1>
          {movie.OriginalTitle && movie.OriginalTitle !== movie.Title && <p className="original-title">{movie.OriginalTitle}</p>}
          {summary.length > 0 && <ul className="detail-summary metadata" aria-label="Film information">
            {summary.map((item, index) => <li key={index}>{item}</li>)}
          </ul>}
          <FavoriteButton movie={movie} {...favorite} />
          {movie.Description && <div className="detail-synopsis">
            <h2>Synopsis</h2>
            <p className="synopsis">{movie.Description}</p>
          </div>}
          {facts.length > 0 && <dl className="detail-facts">
            {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>}
        </div>
      </article>
    </div>
  );
}
