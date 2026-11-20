import React, { useEffect, useState } from "react";
import { posterUrl } from "../../api.mjs";
import { movieGenres, movieRating, releaseYear } from "../../catalog.mjs";

export function Poster({ movie, eager = false, backdrop = false, onUnavailable }) {
  const [failed, setFailed] = useState([]);
  const wide = backdrop ? posterUrl(movie.BackdropPath) : undefined;
  const vertical = posterUrl(movie.ImagePath);
  const url = [wide, vertical].find((image) => image && !failed.includes(image));
  const unavailable = !url;

  useEffect(() => {
    if (unavailable) onUnavailable?.(movie._id);
  }, [unavailable, movie._id, onUnavailable]);

  return (
    <div className={wide ? "poster poster-wide" : "poster"}>
      {url ? (
        <img className={wide && url !== wide ? "artwork-fallback" : undefined} src={url} alt=""
          loading={eager ? "eager" : "lazy"} decoding="async"
          onError={() => setFailed((images) => [...images, url])} />
      ) : <span className="poster-placeholder" aria-hidden="true">{movie.Title}</span>}
    </div>
  );
}

export function FavoriteButton({ movie, saved, busy, onFavorite }) {
  return (
    <button type="button" className={saved ? "button favorite saved" : "button favorite"}
      aria-pressed={saved} disabled={busy} onClick={() => onFavorite(movie._id, saved)}
      aria-label={(saved ? "Remove from favorites: " : "Add to favorites: ") + movie.Title}>
      <span className="favorite-icon" aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function MovieCard({ movie, Link, ...favorite }) {
  const year = releaseYear(movie);
  const genre = movieGenres(movie)[0];
  const rating = movieRating(movie);
  return (
    <article className="movie-card">
      <Poster movie={movie} />
      <div className="card-content">
        <h3 className="movie-title">
          <Link href={"/movies/" + movie._id} title={movie.Title}>{movie.Title}</Link>
        </h3>
        <div className="card-meta metadata">
          {(year || genre) && <span className="card-genre" title={genre}>{[year, genre].filter(Boolean).join(" · ")}</span>}
          {rating && <span className="card-rating">{rating}</span>}
        </div>
        <FavoriteButton movie={movie} {...favorite} />
      </div>
    </article>
  );
}
