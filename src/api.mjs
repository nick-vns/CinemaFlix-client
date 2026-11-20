const base = (import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const isId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const optionalText = (value) => value == null || typeof value === "string";

export const isMovie = (movie) => Boolean(movie && typeof movie.Title === "string" && isId(movie._id) &&
  [movie.Description, movie.ImagePath, movie.Genre?.Name, movie.Genre?.Description,
    movie.Director?.Name, movie.Director?.Bio, movie.OriginalTitle, movie.ReleaseDate,
    movie.BackdropPath].every(optionalText) &&
  (movie.Genres == null || (Array.isArray(movie.Genres) && movie.Genres.every((name) => typeof name === "string"))) &&
  (movie.Actors == null || (Array.isArray(movie.Actors) && movie.Actors.every((name) => typeof name === "string"))));
export const isCatalog = (movies) => Array.isArray(movies) && movies.every(isMovie);
export const isProfile = (profile) => Boolean(profile && typeof profile.Username === "string" &&
  typeof profile.Email === "string" && optionalText(profile.Birthday) &&
  Array.isArray(profile.FavoriteMovies) && profile.FavoriteMovies.every(isId));
export const isLogin = (result) => Boolean(result && typeof result.token === "string" && isProfile(result.user));

export async function api(path, { token, method = "GET", body, check } = {}) {
  let response;
  try {
    response = await fetch(base + path, {
      method,
      credentials: "omit",
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: "Bearer " + token }),
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("CinemaFlix could not reach the API. Check your connection and try again.");
  }

  if (response.status === 204 && !check) return;
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    const fallback = response.status >= 500 ? "CinemaFlix is temporarily unavailable. Try again shortly."
      : response.status === 401 ? "Please sign in again." : "Your request could not be completed.";
    throw new ApiError(typeof data?.message === "string" ? data.message : fallback, response.status);
  }
  if (data === undefined || (check && !check(data))) {
    throw new ApiError("The API returned an unexpected response. Try again shortly.");
  }
  return data;
}

export function posterUrl(path) {
  if (typeof path !== "string" || !path.trim()) return undefined;
  const url = URL.parse(path, base + "/");
  if (url && ["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href;
}
