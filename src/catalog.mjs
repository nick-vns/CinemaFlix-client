export function movieGenres(movie) {
  return [...new Set([movie.Genre?.Name, ...(movie.Genres ?? [])].filter(Boolean))];
}

export function releaseYear(movie) {
  return /^\d{4}(?=-|$)/.exec(String(movie.ReleaseDate ?? movie.Release ?? ""))?.[0];
}

export function movieRating(movie) {
  return Number.isFinite(movie.Rating) && movie.VoteCount !== 0 ? movie.Rating.toFixed(1) + "/10" : null;
}

export function filterMovies(movies, { query, genre, order }) {
  const title = query.trim().toLocaleLowerCase();
  return movies.filter((movie) =>
    [movie.Title, movie.OriginalTitle].some((name) => name?.toLocaleLowerCase().includes(title)) &&
    (!genre || movieGenres(movie).includes(genre)))
    .sort((first, second) => {
      const alphabetical = first.Title.localeCompare(second.Title, undefined, { sensitivity: "base" });
      if (order === "desc") return -alphabetical;
      if (order === "release-desc") {
        const release = (movie) => movie.ReleaseDate ?? releaseYear(movie) ?? "";
        return release(second).localeCompare(release(first)) || alphabetical;
      }
      if (order === "rating-desc") {
        const rating = (movie) => movieRating(movie) ? movie.Rating : -1;
        return rating(second) - rating(first) || alphabetical;
      }
      return alphabetical;
    });
}
