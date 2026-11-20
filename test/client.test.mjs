import test from "node:test";
import assert from "node:assert/strict";
import { api, isCatalog, isLogin, isProfile, posterUrl } from "../src/api.mjs";
import { filterMovies, movieGenres, movieRating, releaseYear } from "../src/catalog.mjs";

const profile = { Username: "viewer", Email: "viewer@example.test", FavoriteMovies: [] };

test("catalog filters combine literal case-insensitive title search, genre, and sorting", () => {
  const movies = [
    { Title: "Sequel [2]", Genre: { Name: "Comedy" } },
    { Title: "Another [2]", Genre: { Name: "Drama" } },
    { Title: "Alpha [2]", Genre: { Name: "Comedy" } },
    { Title: "Original" },
  ];
  const filter = (genre, order) => filterMovies(movies, { query: " [2] ", genre, order }).map((movie) => movie.Title);
  assert.deepEqual(filter("Comedy", "asc"), ["Alpha [2]", "Sequel [2]"]);
  assert.deepEqual(filter("Comedy", "desc"), ["Sequel [2]", "Alpha [2]"]);
  assert.deepEqual(filter("Other", "asc"), []);
  assert.equal(movies[0].Title, "Sequel [2]");
  assert.equal(filterMovies(movies, { query: "sEQUEL", genre: "", order: "asc" }).length, 1);
});

test("client sends a bearer token and handles successful JSON, expiry, malformed data and outages", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(profile));
  assert.deepEqual(await api("/me", { token: "sample", check: isProfile }), profile);
  const [, options] = fetch.mock.calls[0].arguments;
  assert.equal(options.headers.Authorization, "Bearer sample");
  assert.equal(options.credentials, "omit");

  fetch.mock.mockImplementation(async () => Response.json({ message: "Sign in again" }, { status: 401 }));
  await assert.rejects(api("/me"), { status: 401, message: "Sign in again" });
  fetch.mock.mockImplementation(async () => new Response("<html>wrong host</html>"));
  await assert.rejects(api("/movies", { check: isCatalog }), /unexpected response/);
  fetch.mock.mockImplementation(async () => Response.json([{ Title: "Missing ID" }]));
  await assert.rejects(api("/movies", { check: isCatalog }), /unexpected response/);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  await assert.rejects(api("/movies"), { status: 503, message: /temporarily unavailable/ });
  fetch.mock.mockImplementation(async () => new Response(null, { status: 204 }));
  assert.equal(await api("/logout", { method: "POST" }), undefined);
  fetch.mock.mockImplementation(async () => { throw new TypeError("network down"); });
  await assert.rejects(api("/movies"), /could not reach/);
});

test("rejects invalid movie metadata and unsafe poster URLs", () => {
  assert.equal(isLogin({ user: profile, token: "valid-shape" }), true);
  assert.equal(isProfile({ ...profile, Birthday: {} }), false);
  assert.equal(isCatalog([{ _id: "123456789012345678901234", Title: "Film", Genre: { Name: {} } }]), false);
  assert.equal(posterUrl("javascript:alert(1)"), undefined);
  assert.equal(posterUrl("https://example.test/poster.jpg"), "https://example.test/poster.jpg");
});

test("catalog supports secondary genres, original titles, release dates and ratings", () => {
  const legacy = { Title: "Legacy", Genre: { Name: "Drama" }, Release: "1999" };
  const movie = { Title: "Translated", OriginalTitle: "Original", Genre: { Name: "Drama" },
    Genres: ["Drama", "Mystery"], ReleaseDate: "2024-02-29", Rating: 6.7, VoteCount: 20 };
  const newer = { Title: "Newer", ReleaseDate: "2025-01-01", Rating: 0, VoteCount: 0 };
  const films = [legacy, movie, newer];
  assert.deepEqual(movieGenres(movie), ["Drama", "Mystery"]);
  assert.equal(releaseYear(legacy), "1999");
  assert.equal(releaseYear(movie), "2024");
  assert.equal(movieRating(movie), "6.7/10");
  assert.equal(movieRating(newer), null);
  assert.deepEqual(filterMovies(films, { query: "original", genre: "Mystery", order: "asc" }), [movie]);
  assert.deepEqual(filterMovies(films, { query: "", genre: "", order: "release-desc" }), [newer, movie, legacy]);
  assert.deepEqual(filterMovies(films, { query: "", genre: "", order: "rating-desc" }), [movie, legacy, newer]);
});
