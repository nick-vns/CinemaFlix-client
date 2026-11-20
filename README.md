# CinemaFlix React

CinemaFlix is a React movie discovery app with search, genre filters, movie details, account management, and saved favorites. It uses the sibling Express/MongoDB API and the existing catalog metadata and poster URLs.

## Run and test locally

1. Install Node.js 22.12 or later and start the API using the backend instructions.
2. In `CinemaFlix-client`, run `npm ci` and `cp .env.example .env`.
3. Keep `VITE_API_BASE_URL=http://localhost:8080` in `.env` for local use. Run `npm run dev` and open `http://localhost:5173`.
4. Run `npm test` for catalog and API client tests. Run `npm run build` to generate `build/`, and `npm run preview -- --port 5173` to serve that build after stopping the dev server. `dist/` contains historical Parcel artifacts.
5. To run automated browser tests with fixture responses, build with the local API URL above, run `npx playwright-core install chromium`, then run `npm run test:browser`. Alternatively, set `CHROME_PATH` to an existing Chrome executable. Browser tests exercise the production bundle at desktop and mobile sizes.

### Test with the actual API

1. Start local MongoDB and the Express API. Open `http://localhost:8080/health` and confirm it reports `ok`. If the catalog is empty, use the movies-only import instructions in the backend README.
2. In the React app, search for a known film, filter by its genre, change the sort order, and open a detail page. Reload the detail URL.
3. Create a new local test account, try a wrong password, and sign in with the correct one. Save a film, open Favorites, reload, and remove the film. Verify it stays removed.
4. Update the account email, reload, and confirm it persisted. Sign out, then sign in again. Change the password and verify you are prompted to sign in again. Confirm account deletion using the test account.
5. Resize to a phone width and use Tab to move through navigation and form controls. Stop the API and reload the catalog to verify the recovery message. Restart the API and select **Try again**.

## Deploy and session behavior

Use `VITE_API_BASE_URL` at build time with the API's HTTPS URL. This value is public and is included in the bundle. The API's signing key and MongoDB URI belong on the API service. Netlify should publish `build/` with the repository's SPA rewrite. Posters with unavailable URLs fall back to text. Production poster origins must use HTTPS.

The app stores the one-hour bearer token in session storage. Reloads in the same tab preserve the session. The app clears expired or rejected tokens and calls the API to revoke tokens during sign-out. If the API is unreachable, the app can clear the local token and report that server revocation failed. Browser JavaScript can access session storage, so the production configuration restricts script sources. There is no automatic token refresh.

The previous hosted React demo was listed in the old README. Its availability and the v2 deployment URL have not been verified.
