import React, { useState } from "react";
import { AccountFields, accountData } from "../profile-view/profile-view.jsx";

export function LoginView({ onSubmit, Link, register = false }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit(accountData(event.currentTarget, true));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel auth-panel">
      <h1>{register ? "Create your account" : "Sign in"}</h1>
      <p className="panel-intro">{register ? "Start saving your favorite movies." : "Sign in to see your saved movies."}</p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <AccountFields login={!register} />
          <button className="button primary">{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
        </fieldset>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <p className="panel-footer">{register ? "Already have an account? " : "New to CinemaFlix? "}
        <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link>
      </p>
    </section>
  );
}
