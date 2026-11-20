import React, { useState } from "react";

export function AccountFields({ profile, login = false }) {
  return (
    <>
      <label>Username<input name="Username" required maxLength={login ? 256 : Math.max(32, profile?.Username.length ?? 0)}
        pattern={login || profile ? undefined : "[A-Za-z0-9_.\\-]{3,32}"} autoComplete="username"
        defaultValue={profile?.Username} aria-describedby={!login && !profile ? "username-rules" : undefined} />
        {!login && !profile && <span className="field-caption" id="username-rules" aria-hidden="true">
          3–32 letters, numbers, dots, underscores or hyphens.
        </span>}
      </label>
      {!login && <>
        <label>Email<input name="Email" required type="email" maxLength={254}
          autoComplete="email" defaultValue={profile?.Email} /></label>
        <label>Birthday (optional)<input name="Birthday" type="date" autoComplete="bday"
          max={new Date().toISOString().slice(0, 10)} defaultValue={profile?.Birthday?.slice(0, 10)} /></label>
      </>}
      <label>{profile ? "New password (optional)" : "Password"}
        <input name="Password" type="password" required={!profile} minLength={login ? undefined : 8}
          autoComplete={login ? "current-password" : "new-password"}
          aria-describedby={login ? undefined : "password-rules"} />
        {!login && <span className="field-caption" id="password-rules" aria-hidden="true">Use at least 8 characters.</span>}
      </label>
    </>
  );
}

export function accountData(form, keepPassword = false) {
  const data = Object.fromEntries(new FormData(form));
  if (!keepPassword && !data.Password) delete data.Password;
  return data;
}

export function ProfileView({ profile, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = accountData(form);
    // Keep unchanged legacy values out of the update request.
    for (const key of ["Username", "Email", "Birthday"]) {
      const current = key === "Birthday" ? profile.Birthday?.slice(0, 10) || "" : profile[key];
      if (data[key] === current) delete data[key];
    }
    setFeedback("");
    setError("");
    if (!Object.keys(data).length) {
      setFeedback("No changes to save.");
      return;
    }
    setBusy(true);
    try {
      await onUpdate(data);
      form.elements.Password.value = "";
      setFeedback("Your changes were saved.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!window.confirm("Permanently delete your CinemaFlix account and saved favorites?")) return;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await onDelete();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <h1>Your profile</h1>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <AccountFields profile={profile} />
          <button className="button primary">Save changes</button>
        </fieldset>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {feedback && <p className="success" role="status">{feedback}</p>}
      <div className="delete-section">
        <h2>Delete account</h2>
        <p>This permanently removes your profile and saved favorites.</p>
        <button type="button" className="button danger" disabled={busy} onClick={remove}>Delete account</button>
      </div>
    </section>
  );
}
