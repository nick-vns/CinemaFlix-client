import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api, isCatalog, isLogin, isMovie, isProfile, posterUrl } from "../../api.mjs";
import { filterMovies, movieGenres, releaseYear } from "../../catalog.mjs";
import { LoginView } from "../login-view/login-view.jsx";
import { SignupView } from "../signup-view/signup-view.jsx";
import { MovieCard, Poster } from "../movie-card/movie-card.jsx";
import { MovieView } from "../movie-view/movie-view.jsx";
import { NavigationBar } from "../navigation-bar/navigation-bar.jsx";
import { ProfileView } from "../profile-view/profile-view.jsx";

const sessionKey = "cinemaflix.session";
function readSession() {
  try { return sessionStorage.getItem(sessionKey) || ""; } catch { return ""; }
}

const Navigation = createContext(null);

function Link({ href, onClick, ...props }) {
  const navigate = useContext(Navigation);
  return <a {...props} href={href} onClick={(event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    navigate(href);
  }} />;
}

function useResource(loader, key) {
  const [result, setResult] = useState({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!key) return;
    let active = true;
    loader().then(
      (data) => { if (active) setResult({ key, attempt, data }); },
      (error) => { if (active) setResult({ key, attempt, error }); }
    );
    return () => { active = false; };
  }, [key, attempt]);
  const current = result.key === key && result.attempt === attempt ? result : {};
  return { ...current, retry: () => setAttempt((previous) => previous + 1) };
}

const initialFilters = { query: "", genre: "", order: "asc" };

function Loading({ label, layout = "catalog" }) {
  return (
    <div role="status" className="loading">
      <p className="metadata">{label}</p>
      {layout === "catalog" ? (
        <div className="movie-grid" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <div className="movie-card" key={index}>
            <div className="poster skeleton" />
            <div className="card-content"><div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-meta" /><div className="skeleton skeleton-button" /></div>
          </div>)}
        </div>
      ) : <div className={"skeleton skeleton-" + layout} aria-hidden="true" />}
    </div>
  );
}

function ErrorState({ error, retry }) {
  return (
    <div className="empty">
      <h2>Couldn’t load this page</h2>
      <p role="alert">{error.message}</p>
      <button type="button" className="button" onClick={retry}>Try again</button>
    </div>
  );
}

export function MainView() {
  const [path, setPath] = useState(window.location.pathname);
  const [token, setToken] = useState(readSession);
  const activeToken = useRef(token);
  const main = useRef(null);
  const redirectAfterLogin = useRef("/");
  const pendingFavorite = useRef("");
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [unavailableArtwork, setUnavailableArtwork] = useState([]);
  const detailId = /^\/movies\/([^/]+)\/?$/.exec(path)?.[1];
  const catalog = useResource(() => api("/movies", { check: isCatalog }), path === "/" ? "catalog" : "");
  const detail = useResource(() => api("/movies/id/" + encodeURIComponent(detailId), { check: isMovie }), detailId);

  function setSession(nextToken, nextProfile = null) {
    activeToken.current = nextToken;
    try {
      if (nextToken) sessionStorage.setItem(sessionKey, nextToken);
      else sessionStorage.removeItem(sessionKey);
    } catch { /* The in-memory session remains usable. */ }
    setToken(nextToken);
    setProfile(nextProfile);
    setProfileError(null);
  }

  async function authenticated(path, options = {}, requestToken = activeToken.current) {
    try {
      return await api(path, { ...options, token: requestToken });
    } catch (error) {
      if (requestToken && requestToken === activeToken.current && error.status === 401) {
        setSession("");
        setNotice("Your session ended. Sign in again to continue.");
      }
      throw error;
    }
  }

  useEffect(() => {
    if (!token || profile) return;
    let active = true;
    authenticated("/me", { check: isProfile }, token).then(
      (user) => { if (active) setProfile(user); },
      (error) => { if (active) setProfileError(error); }
    );
    return () => { active = false; };
  }, [token, profileAttempt, profile]);

  const favorites = useResource(() => authenticated("/me/favorites", { check: isCatalog }),
    path === "/favorites" && profile ? token + JSON.stringify(profile.FavoriteMovies) : "");

  useEffect(() => {
    function onPop() {
      setPath(window.location.pathname);
      setActionError("");
      main.current?.focus({ preventScroll: true });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(href) {
    if (href === window.location.pathname) return;
    if (href === "/login" && ["/profile", "/favorites"].includes(path)) redirectAfterLogin.current = path;
    window.history.pushState(null, "", href);
    setPath(href);
    setActionError("");
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  async function signIn(body) {
    const { token: newToken, user } = await api("/login", { method: "POST", body, check: isLogin });
    setSession(newToken, user);
    setNotice("");
    const destination = redirectAfterLogin.current;
    redirectAfterLogin.current = "/";
    navigate(destination);
    const movie = pendingFavorite.current;
    pendingFavorite.current = "";
    if (movie && !user.FavoriteMovies.includes(movie)) await toggleFavorite(movie, false, newToken);
  }

  async function register(body) {
    await api("/users", { method: "POST", body, check: isProfile });
    setNotice("Your account is ready. Sign in to continue.");
    navigate("/login");
  }

  async function logout() {
    setLoggingOut(true);
    setActionError("");
    try {
      await authenticated("/logout", { method: "POST" });
      setSession("");
      setNotice("You signed out.");
      navigate("/");
    } catch (error) {
      if (error.status !== 401) {
        setSession("");
        navigate("/");
        setNotice("You signed out of this tab. The API could not revoke your session.");
      }
    } finally {
      setLoggingOut(false);
    }
  }

  async function toggleFavorite(id, saved, requestToken = token) {
    if (!requestToken) {
      redirectAfterLogin.current = path;
      pendingFavorite.current = id;
      setNotice("Sign in to save this movie.");
      navigate("/login");
      return;
    }
    setFavoriteBusy(true);
    setActionError("");
    try {
      const user = await authenticated("/me/favorites/" + id,
        { method: saved ? "DELETE" : "POST", check: isProfile }, requestToken);
      if (requestToken === activeToken.current) {
        setProfile((current) => current ? { ...current, FavoriteMovies: user.FavoriteMovies } : user);
      }
    } catch (error) {
      if (error.status !== 401) setActionError(error.message);
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function updateProfile(body) {
    const requestToken = token;
    const user = await authenticated("/me", { method: "PUT", body, check: isProfile });
    if (requestToken !== activeToken.current) return;
    if (body.Password) {
      setSession("");
      setNotice("Password changed. Sign in with your new password.");
      navigate("/login");
    } else setProfile((current) => ({ ...user, FavoriteMovies: current?.FavoriteMovies ?? user.FavoriteMovies }));
  }

  async function deleteProfile() {
    await authenticated("/me", { method: "DELETE" });
    setSession("");
    setNotice("Your account was deleted.");
    navigate("/");
  }

  const favoriteProps = (movie) => ({
    Link, saved: profile?.FavoriteMovies.includes(movie._id) ?? false,
    busy: favoriteBusy || loggingOut || Boolean(token && !profile), onFavorite: toggleFavorite,
  });

  function grid(movies) {
    return <div className="movie-grid">{movies.map((movie) =>
      <MovieCard key={movie._id} movie={movie} {...favoriteProps(movie)} />)}</div>;
  }

  function explore() {
    if (catalog.error) return <ErrorState {...catalog} />;
    if (!catalog.data) return <Loading label="Loading movies…" />;
    const featured = catalog.data.find((movie) => movie.Featured && movie.Description?.trim() &&
      !unavailableArtwork.includes(movie._id) && (posterUrl(movie.BackdropPath) || posterUrl(movie.ImagePath)));
    const hasFilters = filters.query !== "" || filters.genre !== "" || filters.order !== initialFilters.order;
    const genres = [...new Set(catalog.data.flatMap(movieGenres))].sort();
    const movies = filterMovies(catalog.data, filters);
    const featureMetadata = featured && [releaseYear(featured), movieGenres(featured)[0]].filter(Boolean).join(" · ");
    const change = (key) => (event) => {
      const { value } = event.target;
      setFilters((current) => ({ ...current, [key]: value }));
    };
    return (
      <>
        {featured && <section className="featured" aria-labelledby="featured-title">
          <div className="featured-content">
            <p className="featured-label metadata">Featured film</p>
            <h1 id="featured-title">{featured.Title}</h1>
            {featureMetadata && <p className="metadata">{featureMetadata}</p>}
            <p className="synopsis">{featured.Description}</p>
            <Link className="button primary" href={"/movies/" + featured._id}>View film details</Link>
          </div>
          <div className="featured-art">
            <Poster key={featured._id} movie={featured} eager backdrop onUnavailable={(id) =>
              setUnavailableArtwork((ids) => ids.includes(id) ? ids : [...ids, id])} />
          </div>
        </section>}
        <section aria-labelledby="catalog-title">
          <div className="section-heading">
            {featured ? <h2 id="catalog-title">Explore films</h2> : <h1 id="catalog-title">Explore films</h1>}
            <p className="metadata" role="status">{movies.length} {movies.length === 1 ? "film" : "films"}</p>
          </div>
          <div className="filters">
            <label className="search-field">Search by title<span className="search-control">
              <input type="search" placeholder="Search films" value={filters.query} onChange={change("query")} />
            </span></label>
            <label>Genre<select data-selected={Boolean(filters.genre)} value={filters.genre} onChange={change("genre")}>
              <option value="">All genres</option>
              {genres.map((genre) => <option key={genre}>{genre}</option>)}
            </select></label>
            <label>Sort by<select data-selected={filters.order !== initialFilters.order} value={filters.order} onChange={change("order")}>
              <option value="asc">Title A–Z</option><option value="desc">Title Z–A</option>
              <option value="release-desc">Newest release</option><option value="rating-desc">Highest rated</option>
            </select></label>
            <button type="button" className="button filter-reset" disabled={!hasFilters}
              onClick={() => setFilters(initialFilters)}>Reset</button>
          </div>
          {movies.length ? grid(movies) : <div className="empty">
            <h2>{catalog.data.length ? "No films match your filters." : "The movie catalog is empty."}</h2>
            {catalog.data.length > 0 && <button type="button" className="button" onClick={() => setFilters(initialFilters)}>
              Clear filters
            </button>}
          </div>}
        </section>
      </>
    );
  }

  let content;
  if (path === "/") content = explore();
  else if (detailId) content = detail.error ? <ErrorState {...detail} />
    : detail.data ? <MovieView movie={detail.data} {...favoriteProps(detail.data)} />
      : <Loading label="Loading film details…" layout="detail" />;
  else if (["/profile", "/favorites"].includes(path)) {
    if (!token) content = <div className="empty"><h1>Sign in to continue</h1>
      <Link className="button primary" href="/login">Sign in</Link></div>;
    else if (profileError) content = <ErrorState error={profileError} retry={() => {
      setProfileError(null);
      setProfileAttempt((value) => value + 1);
    }} />;
    else if (!profile) content = <Loading label="Restoring your session…" layout="panel" />;
    else if (path === "/profile") content = <ProfileView profile={profile} onUpdate={updateProfile} onDelete={deleteProfile} />;
    else content = <section>
      <h1>Your favorites</h1>
      {favorites.error ? <ErrorState {...favorites} /> : !favorites.data ? <Loading label="Loading favorites…" />
        : favorites.data.length ? grid(favorites.data)
          : <div className="empty"><h2>You haven’t saved any films yet.</h2><Link className="button" href="/">Explore films</Link></div>}
    </section>;
  } else if (path === "/credits") content = <section className="panel">
    <h1>Credits</h1>
    <a href="https://www.themoviedb.org">
      <img className="tmdb-logo" width="105" alt="The Movie Database (TMDB)"
        src="https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" />
    </a>
    <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </section>;
  else if (path === "/login") content = <LoginView onSubmit={signIn} Link={Link} />;
  else if (path === "/register" || path === "/signup") content = <SignupView onSubmit={register} Link={Link} />;
  else content = <div className="empty"><h1>Page not found</h1><Link href="/">Explore films</Link></div>;

  return (
    <Navigation.Provider value={navigate}>
      <a href="#main" className="skip-link">Skip to content</a>
      <NavigationBar Link={Link} path={path} signedIn={Boolean(token)} onLogout={logout} loggingOut={loggingOut} />
      <main id="main" className="container" ref={main} tabIndex={-1}>
        {notice && <p className="notice" role="status">{notice}</p>}
        {actionError && <p className="error" role="alert">{actionError}</p>}
        {content}
      </main>
      <footer className="site-footer">
        <div className="container footer-content">
          <Link href="/" className="footer-brand">CinemaFlix</Link>
          <Link href="/credits" aria-current={path === "/credits" ? "page" : undefined}>Credits</Link>
        </div>
      </footer>
    </Navigation.Provider>
  );
}
