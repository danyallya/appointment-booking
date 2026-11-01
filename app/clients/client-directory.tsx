"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FiArrowUpRight, FiBell, FiCalendar, FiClock, FiMoon, FiPlus, FiSearch, FiSun, FiUsers } from "react-icons/fi";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

export default function ClientDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    const timer = window.setTimeout(async () => {
      const search = query.trim();
      const endpoint = search ? `/api/clients?q=${encodeURIComponent(search)}` : "/api/clients";
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load the client directory.");
        setClients(payload.clients as Client[]);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load the client directory.");
        setClients([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, refreshKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFeedback("");

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not add the client.");

      setName("");
      setEmail("");
      setPhone("");
      setQuery("");
      setRefreshKey((value) => value + 1);
      setFeedback("Client added to the local studio directory.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not add the client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={dark ? "shell dark" : "shell"}>
      <aside className="side">
        <div className="brand"><i>a</i><div><b>AURELLE</b><small>CARE STUDIO</small></div></div>
        <small className="label">WORKSPACE</small>
        <Link className="nav" href="/"><FiCalendar />Overview</Link>
        <Link className="nav" href="/"><FiClock />Appointments</Link>
        <Link aria-current="page" className="nav active" href="/clients"><FiUsers />Clients</Link>
        <div className="aside-note">✦<p>Your studio,<br />in its best rhythm.</p><small>Everything in one considered place.</small></div>
        <div className="user"><i>EC</i><span><b>Emma Clarke</b><small>Studio owner</small></span></div>
      </aside>

      <section className="main">
        <header>
          <span>Workspace <i>/</i> <b>Clients</b></span>
          <div><button aria-label="Notifications"><FiBell /></button><button aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>{dark ? <FiSun /> : <FiMoon />}</button><i className="user-dot">EC</i></div>
        </header>

        <div className="wrap client-wrap">
          <section className="welcome client-welcome">
            <div><small className="eyebrow">CLIENT DIRECTORY · LOCAL PREVIEW</small><h1>Care begins<br /><em>with knowing.</em></h1><p>Keep a thoughtful, searchable record for your studio.</p></div>
            <Link className="primary directory-back" href="/"><FiArrowUpRight /> Back to overview</Link>
          </section>

          <div className="directory-grid">
            <section className="calendar client-list-panel" aria-labelledby="clients-heading">
              <div className="heading"><div><small>YOUR STUDIO</small><h2 id="clients-heading">Clients <i>{clients.length}</i></h2></div></div>
              <div className="client-search">
                <FiSearch aria-hidden="true" />
                <label className="sr-only" htmlFor="client-search">Search clients</label>
                <input id="client-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or phone" maxLength={80} />
                {query && <button type="button" onClick={() => setQuery("")}>Clear</button>}
              </div>

              <div className="client-results" aria-live="polite" aria-busy={loading}>
                {loading ? <p className="empty">Finding your client records…</p> : loadError ? <p className="directory-error" role="alert">{loadError}</p> : clients.length ? clients.map((client) => (
                  <article className="client-card" key={client.id}>
                    <i aria-hidden="true" className="client-avatar">{client.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</i>
                    <div className="client-card-content">
                      <div className="client-card-heading"><b>{client.name}</b><small>Added {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(client.createdAt))}</small></div>
                      <div className="client-contact"><a href={`mailto:${client.email}`}>{client.email}</a>{client.phone ? <a href={`tel:${client.phone}`}>{client.phone}</a> : <span>No phone recorded</span>}</div>
                    </div>
                  </article>
                )) : <div className="directory-empty"><i><FiUsers /></i><h3>{query ? "No clients found" : "Your directory is ready"}</h3><p>{query ? "Try another name, email or phone number." : "Add your first fictional client to preview the directory."}</p>{query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}</div>}
              </div>
            </section>

            <aside className="directory-form-panel" aria-labelledby="add-client-heading">
              <small className="directory-kicker">A NEW CONNECTION</small>
              <h2 id="add-client-heading">Add a client</h2>
              <p>Contact details are normalized before they are stored in this local preview.</p>
              <form onSubmit={handleSubmit}>
                <label htmlFor="client-name">Full name<input id="client-name" name="name" autoComplete="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label htmlFor="client-email">Email address<input id="client-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <label htmlFor="client-phone">Phone <span>(optional)</span><input id="client-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 (206) 555-0142" /></label>
                {formError && <p className="directory-error" role="alert">{formError}</p>}
                {feedback && <p className="directory-success" role="status">{feedback}</p>}
                <button className="primary directory-submit" type="submit" disabled={saving}><FiPlus />{saving ? "Saving…" : "Add to directory"}</button>
              </form>
              <p className="directory-local-note">Local development preview only. Authentication is required before this directory can handle real client details.</p>
            </aside>
          </div>

          <div className="page-foot">Made for thoughtful care.<span>AURELLE · EST. 2026</span></div>
        </div>
      </section>
    </main>
  );
}
