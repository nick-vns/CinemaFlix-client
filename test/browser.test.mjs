import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const origin = "http://localhost:5173";
const apiOrigin = "http://localhost:8080";
const movies = [
  { _id: "000000000000000000000001", Title: "First Light", Description: "A fixture.", Genre: { Name: "Drama" }, Genres: ["Drama", "Mystery"],
    Featured: true, tmdbId: 42, ReleaseDate: "2024-02-29", Rating: 8.1, VoteCount: 42, Runtime: 113 },
  { _id: "000000000000000000000002", Title: "Last Show", Description: "Another fixture.", Genre: { Name: "Comedy" } },
];

async function setup(t, viewport) {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport });
  const seen = [];
  let available = true;
  let account;
  let signedIn = false;
  await page.route(origin + "/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    const name = pathname.startsWith("/assets/") ? pathname : "/index.html";
    const contentType = name.endsWith(".js") ? "application/javascript"
      : name.endsWith(".css") ? "text/css" : "text/html";
    const body = await readFile(new URL("../build" + name, import.meta.url));
    await route.fulfill({ body, contentType });
  });
  await page.route(apiOrigin + "/**", async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const method = request.method();
    const headers = { "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS" };
    const send = (status, json) => route.fulfill({ status, headers, ...(json !== undefined && { json }) });
    if (method === "OPTIONS") return send(204);
    seen.push(method + " " + pathname);
    if (!available) return route.abort();
    if (pathname === "/movies") return send(200, movies);
    if (pathname.startsWith("/movies/id/")) return send(200, movies.find((movie) => pathname.endsWith(movie._id)));
    if (pathname === "/users") {
      const { Username, Email } = request.postDataJSON();
      account = { Username, Email, FavoriteMovies: [] };
      return send(201, account);
    }
    if (pathname === "/login") {
      if (request.postDataJSON().Password !== "test-password") return send(401, { message: "Invalid username or password." });
      signedIn = true;
      return send(200, { token: "test-token", user: account });
    }
    if (!signedIn || request.headers().authorization !== "Bearer test-token") {
      return send(401, { message: "Sign in again." });
    }
    if (pathname === "/logout") {
      signedIn = false;
      return send(204);
    }
    if (pathname === "/me" && method === "DELETE") {
      account = undefined;
      signedIn = false;
      return send(200, { message: "Account deleted." });
    }
    if (pathname === "/me" && method === "PUT") account = { ...account, ...request.postDataJSON() };
    if (pathname === "/me") return send(200, account);
    if (pathname === "/me/favorites") return send(200, movies.filter((movie) => account.FavoriteMovies.includes(movie._id)));
    if (pathname.startsWith("/me/favorites/")) {
      account.FavoriteMovies = method === "POST" ? [pathname.split("/").at(-1)] : [];
      return send(200, account);
    }
    return send(404, { message: "Route not found." });
  });
  await page.goto(origin);
  return { page, seen, setAvailable: (value) => { available = value; }, expire: () => { signedIn = false; } };
}

test("built React app handles discovery, account lifecycle and favorites", { timeout: 60000 }, async (t) => {
  const { page, seen, expire } = await setup(t, { width: 1280, height: 900 });
  const nav = page.getByRole("navigation");
  await page.getByRole("heading", { name: "Explore films" }).waitFor();
  assert.equal(await page.locator(".movie-card").count(), 2);
  await page.getByLabel("Sort by", { exact: true }).selectOption("desc");
  assert.equal(await page.locator(".movie-title a").first().textContent(), "Last Show");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  assert.equal(await page.locator(".movie-title a").first().textContent(), "First Light");
  await page.getByLabel("Genre", { exact: true }).selectOption("Comedy");
  assert.equal(await page.locator(".movie-card").count(), 1);
  await page.getByLabel("Search by title").fill("first");
  await page.getByText("No films match your filters.").waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  assert.equal(await page.getByLabel("Genre", { exact: true }).inputValue(), "");
  assert.equal(await page.getByLabel("Search by title").inputValue(), "");
  await page.locator(".movie-card h3").getByRole("link", { name: "First Light" }).click();
  await page.getByRole("heading", { name: "First Light" }).waitFor();
  await page.getByText("2024-02-29", { exact: true }).waitFor();
  await page.getByText("113 min", { exact: true }).waitFor();
  await page.getByText("8.1/10 · 42 votes", { exact: true }).waitFor();

  await nav.getByRole("link", { name: "Create account" }).click();
  await page.getByLabel("Username").fill("reviewer");
  await page.getByLabel("Email").fill("reviewer@example.test");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByText("Your account is ready.").waitFor();
  await page.getByLabel("Username").fill("reviewer");
  await page.getByLabel("Password").fill("bad-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByText("Invalid username or password.", { exact: true }).waitFor();
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Add to favorites: First Light" }).click();

  await nav.getByRole("link", { name: "Favorites" }).click();
  await page.getByRole("button", { name: "Remove from favorites: First Light" }).click();
  await page.getByText("You haven’t saved any films yet.").waitFor();
  await nav.getByRole("link", { name: "Profile" }).click();
  await page.getByLabel("Email").fill("updated@example.test");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Your changes were saved.").waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "Your profile" }).waitFor();
  assert.equal(await page.getByLabel("Email").inputValue(), "updated@example.test");

  await nav.getByRole("button", { name: "Sign out" }).click();
  await page.getByText("You signed out.").waitFor();
  assert.ok(seen.includes("POST /logout"));

  await nav.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Username").fill("reviewer");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await nav.getByRole("link", { name: "Profile" }).click();
  expire();
  await page.reload();
  await page.getByText("Your session ended.").waitFor();
  await page.getByRole("heading", { name: "Sign in to continue" }).waitFor();

  await nav.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Username").fill("reviewer");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await nav.getByRole("link", { name: "Profile" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByText("Your account was deleted.").waitFor();
  assert.ok(seen.includes("DELETE /me"));
});

test("layouts fit the requested viewports and mobile navigation stays keyboard accessible", { timeout: 35000 }, async (t) => {
  const { page, setAvailable } = await setup(t, { width: 320, height: 800 });
  await page.getByRole("heading", { name: "Explore films" }).waitFor();
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const menu = page.getByRole("button", { name: "Menu" });
  const nav = page.getByRole("navigation");
  for (const width of [320, 375, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    assert.ok(await fits(), "Catalog overflows at " + width + "px");
    assert.equal(await menu.isVisible(), width <= 375);
    const poster = await page.locator(".movie-card .poster").first().boundingBox();
    assert.ok(Math.abs(poster.width / poster.height - 2 / 3) < 0.01);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Skip to content");
  await menu.focus();
  await page.keyboard.press("Enter");
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await nav.getByRole("link", { name: "Sign in" }).focus();
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(await menu.evaluate((button) => document.activeElement === button), true);
  await menu.click();
  await nav.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: "Sign in", exact: true }).waitFor();
  assert.ok(await fits());
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  await page.getByRole("link", { name: "Create an account" }).click();
  await page.getByRole("heading", { name: "Create your account" }).waitFor();
  assert.ok(await fits());

  await page.getByRole("banner").getByRole("link", { name: "CinemaFlix" }).click();
  setAvailable(false);
  await page.reload();
  await page.getByText("CinemaFlix could not reach the API.", { exact: false }).waitFor();
  setAvailable(true);
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByRole("heading", { name: "Explore films" }).waitFor();
});
