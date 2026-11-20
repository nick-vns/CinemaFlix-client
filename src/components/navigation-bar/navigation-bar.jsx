import React, { useEffect, useRef, useState } from "react";

export function NavigationBar({ Link, path, signedIn, onLogout, loggingOut }) {
  const [expanded, setExpanded] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => setExpanded(false), [path, signedIn]);

  function closeOnEscape(event) {
    if (event.key === "Escape" && expanded) {
      setExpanded(false);
      menuButton.current?.focus();
    }
  }

  const item = (href, label, className) => (
    <Link href={href} className={className} onClick={() => setExpanded(false)}
      aria-current={path === href || (href === "/register" && path === "/signup") ? "page" : undefined}>
      {label}
    </Link>
  );

  return (
    <header className="site-header" onKeyDown={closeOnEscape}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}>
      <div className="header-content container">
        <Link href="/" className="brand" onClick={() => setExpanded(false)}>
          <span className="brand-mark" aria-hidden="true" />CinemaFlix
        </Link>
        <button ref={menuButton} type="button" className="button menu-toggle" aria-expanded={expanded}
          aria-controls="main-navigation" onClick={() => setExpanded((open) => !open)}>
          <span className="menu-icon" aria-hidden="true" /> Menu
        </button>
        <nav id="main-navigation" className={expanded ? "site-nav is-open" : "site-nav"} aria-label="Main navigation">
          {item("/", "Explore")}
          {signedIn ? (
            <>
              {item("/favorites", "Favorites")}{item("/profile", "Profile")}
              <button type="button" className="button nav-action" disabled={loggingOut} onClick={onLogout}>Sign out</button>
            </>
          ) : <>{item("/login", "Sign in")}{item("/register", "Create account", "button nav-action")}</>}
        </nav>
      </div>
    </header>
  );
}
