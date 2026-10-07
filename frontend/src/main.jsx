import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const RESOURCE_NAMES = ['users', 'stations', 'routes', 'fares', 'tickets', 'payments'];
const EMPTY_DATA = { users: [], stations: [], routes: [], fares: [], tickets: [], payments: [] };
const NAV_ITEMS = {
  admin: [['dashboard', 'Dashboard'], ['book', 'Issue ticket'], ['tickets', 'Tickets'], ['network', 'Network'], ['users', 'Users'], ['admin', 'Admin']],
  passenger: [['dashboard', 'Home'], ['book', 'Book'], ['tickets', 'My tickets'], ['network', 'Network']]
};

async function api(resource, options = {}) {
  const response = await fetch(`/api/${resource}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `${response.status} ${response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

const displayName = (user) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.userId || 'Metro user';
const money = (value) => `Rs ${Number(value || 0).toFixed(2)}`;
const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : '-';
const isTicketActive = (ticket) => !ticket.isUsed && (!ticket.validUntil || new Date(ticket.validUntil) > new Date());

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('metroUser') || 'null');
  } catch {
    localStorage.removeItem('metroUser');
    return null;
  }
}

function Icon({ name }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22z" /><path d="M5 4.5v15A2.5 2.5 0 0 1 7.5 17H20" /><path d="M9 7h7" /></>,
    tickets: <><path d="M3 7a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4h18a2 2 0 0 0 0-4v-2a2 2 0 0 0 0-4z" /><path d="M13 7v2m0 3v2m0 3v1" /></>,
    network: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="7" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="m8.2 7 7.1-.1M7.3 8l3.5 7.7m5.8-6.6-3.5 6.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    admin: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    swap: <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
    train: <><rect x="5" y="3" width="14" height="16" rx="4" /><path d="M8 19l-2 3m10-3 2 3M8 7h.01M16 7h.01M5 14h14" /></>
  };
  return <svg {...common}>{paths[name] || paths.dashboard}</svg>;
}

function Brand({ link = false }) {
  const content = <><span className="brand-mark"><Icon name="train" /></span><strong>MetroPass</strong></>;
  return link ? <a className="brand-row" href="#dashboard" aria-label="MetroPass home">{content}</a> : <div className="brand-row">{content}</div>;
}

function AuthScreen({ onSignIn, onSignUp }) {
  const [tab, setTab] = useState('signin');
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');

  async function submit(event, action) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await action(new FormData(event.currentTarget));
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" />
        <div className="auth-train-card"><span className="live-dot" /> CITY NETWORK <strong>Running smoothly</strong><div className="auth-train-track"><span /><span /><span /><span /></div></div>
        <div className="auth-copy">
          <span className="eyebrow light-eyebrow">Your city, in motion</span>
          <h1>Every journey<br />starts here.</h1>
          <p>One simple place to plan your route, book a ride, and stay connected to the city.</p>
          <div className="auth-highlights"><span><Icon name="network" /> City-wide network</span><span><Icon name="tickets" /> Instant ticketing</span></div>
        </div>
        <span className="visual-index">METROPASS · 01</span>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Brand />
          <div className="auth-heading"><span className="eyebrow">WELCOME ABOARD</span><h2>{tab === 'signin' ? 'Good to see you.' : 'Make yourself at home.'}</h2><p>{tab === 'signin' ? 'Sign in to pick up where your journey left off.' : 'Create an account and make your next ride easier.'}</p></div>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button className={tab === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={tab === 'signin'} onClick={() => { setTab('signin'); setError(''); }}>Sign in</button>
            <button className={tab === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={tab === 'signup'} onClick={() => { setTab('signup'); setError(''); }}>Create account</button>
          </div>
          {tab === 'signin' ? (
            <form className="auth-form" onSubmit={(event) => submit(event, (form) => onSignIn(form.get('userId').trim(), form.get('password')))}>
              <label>User ID<input name="userId" autoComplete="username" defaultValue="rider1" required /></label>
              <label>Password<input name="password" type="password" autoComplete="current-password" defaultValue="rider123" required /></label>
              {error && <p className="inline-error" role="alert">{error}</p>}
              <button className="primary-action full-action" type="submit" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <Icon name="arrow" /></>}</button>
              <p className="demo-hint"><strong>Try the demo</strong><span>Passenger: rider1 / rider123</span><span>Admin: admin / admin123</span></p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={(event) => submit(event, (form) => onSignUp({
              userId: form.get('userId').trim(), firstName: form.get('firstName').trim(), lastName: form.get('lastName').trim(),
              contact: form.get('contact').trim(), password: form.get('password'), role: form.get('role')
            }))}>
              <div className="two-fields"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label></div>
              <label>User ID<input name="userId" autoComplete="username" required /></label>
              <label>Contact<input name="contact" type="email" autoComplete="email" placeholder="name@example.com" /></label>
              <label>Account type<select name="role" value={role} onChange={(event) => setRole(event.target.value)}><option value="USER">Passenger</option><option value="ADMIN">Admin</option></select></label>
              <label>Password<input name="password" type="password" autoComplete="new-password" required /></label>
              {error && <p className="inline-error" role="alert">{error}</p>}
              <button className="primary-action full-action" type="submit" disabled={busy}>{busy ? 'Creating account…' : role === 'ADMIN' ? 'Create admin account' : 'Create passenger account'}<Icon name="arrow" /></button>
            </form>
          )}
          <p className="auth-footnote">A smoother ride, from station to station.</p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children, className = '' }) {
  return <label className={className}>{label}{children}</label>;
}

function SelectStations({ stations, value, onChange, placeholder = 'Select station', required = false }) {
  return <select value={value} onChange={onChange} required={required}><option value="">{placeholder}</option>{stations.map((station) => <option key={station.stationId} value={station.stationId}>{station.stationCode || station.stationId}</option>)}</select>;
}

function PanelHeading({ eyebrow, title, action }) {
  return <div className="panel-heading"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div>{action}</div>;
}

function EmptyState({ children }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="train" /></span><p>{children}</p></div>;
}

function App() {
  const [currentUser, setCurrentUser] = useState(readSavedUser);
  const [data, setData] = useState(EMPTY_DATA);
  const [view, setView] = useState(window.location.hash.slice(1) || 'dashboard');
  const [toast, setToast] = useState(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [fareFrom, setFareFrom] = useState('');
  const [fareTo, setFareTo] = useState('');
  const [fareResult, setFareResult] = useState(null);
  const [bookingFrom, setBookingFrom] = useState('');
  const [bookingTo, setBookingTo] = useState('');
  const [bookingType, setBookingType] = useState('SINGLE');
  const [bookingFare, setBookingFare] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const stationName = useCallback((id) => data.stations.find((station) => station.stationId === id)?.stationCode || id || 'Unknown', [data.stations]);
  const findFare = useCallback((from, to) => data.fares.find((fare) => fare.sourceStationId === from && fare.destStationId === to)
    || data.fares.find((fare) => fare.sourceStationId === to && fare.destStationId === from), [data.fares]);
  const activeStations = useMemo(() => data.stations.filter((station) => station.isActive !== false), [data.stations]);
  const visibleTickets = useMemo(() => {
    const pool = isAdmin ? data.tickets : data.tickets.filter((ticket) => ticket.passengerId === currentUser?.userId);
    const query = ticketSearch.toLowerCase();
    return pool.filter((ticket) => `${ticket.ticketId} ${ticket.passengerId} ${stationName(ticket.sourceStationId)} ${stationName(ticket.destStationId)}`.toLowerCase().includes(query));
  }, [currentUser, data.tickets, isAdmin, stationName, ticketSearch]);
  const visibleUsers = useMemo(() => {
    const query = userSearch.toLowerCase();
    return data.users.filter((user) => `${user.userId} ${displayName(user)} ${user.contact || ''} ${user.role || ''}`.toLowerCase().includes(query));
  }, [data.users, userSearch]);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refreshData = useCallback(async () => {
    if (!currentUser) {
      setData(EMPTY_DATA);
      return;
    }
    try {
      const values = await Promise.all(RESOURCE_NAMES.map((resource) => api(resource)));
      setData(Object.fromEntries(RESOURCE_NAMES.map((resource, index) => [resource, values[index] || []])));
    } catch (error) {
      notify(`Could not load metro data: ${error.message}`, true);
    }
  }, [currentUser, notify]);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    const handleHashChange = () => setView(window.location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const allowed = NAV_ITEMS[isAdmin ? 'admin' : 'passenger'].map(([key]) => key);
    if (!allowed.includes(view)) navigate('dashboard');
  }, [currentUser, isAdmin, view]);

  const navigate = (nextView) => {
    const allowed = NAV_ITEMS[isAdmin ? 'admin' : 'passenger'].map(([key]) => key);
    const safeView = allowed.includes(nextView) ? nextView : 'dashboard';
    setView(safeView);
    setMobileNavOpen(false);
    if (window.location.hash.slice(1) !== safeView) window.location.hash = safeView;
  };

  async function signIn(userId, password) {
    try {
      const user = await api('auth/signin', { method: 'POST', body: JSON.stringify({ userId, password }) });
      localStorage.setItem('metroUser', JSON.stringify(user));
      setCurrentUser(user);
      navigate('dashboard');
      notify(`Signed in as ${displayName(user)}`);
    } catch {
      throw new Error('Invalid user ID or password.');
    }
  }

  async function signUp(payload) {
    const user = await api('auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('metroUser', JSON.stringify(user));
    setCurrentUser(user);
    navigate('dashboard');
    notify('Account created');
  }

  function signOut() {
    localStorage.removeItem('metroUser');
    setCurrentUser(null);
    setView('dashboard');
    setData(EMPTY_DATA);
    window.location.hash = '';
  }

  const ticketPool = isAdmin ? data.tickets : data.tickets.filter((ticket) => ticket.passengerId === currentUser?.userId);
  const visiblePayments = isAdmin ? data.payments : data.payments.filter((payment) => ticketPool.some((ticket) => ticket.ticketId === payment.ticketId));
  const revenue = visiblePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const stats = isAdmin
    ? [['Registered riders', data.users.filter((user) => user.role !== 'ADMIN').length, 'Across your network'], ['Tickets issued', data.tickets.length, 'All-time journeys'], ['Open stations', activeStations.length, 'Currently online'], ['Revenue collected', money(revenue), 'From ticket payments']]
    : [['My journeys', ticketPool.length, 'Tickets in your account'], ['Ready to ride', ticketPool.filter(isTicketActive).length, 'Active tickets'], ['Stations', data.stations.length, 'In the metro network'], ['Total spent', money(revenue), 'Ticket payments']];
  const newestTickets = [...ticketPool].sort((a, b) => new Date(b.createdAt || b.issueTime) - new Date(a.createdAt || a.issueTime)).slice(0, 5);
  const bookingFareMatch = findFare(bookingFrom, bookingTo);
  const bookingFromName = stationName(bookingFrom);
  const bookingToName = stationName(bookingTo);
  const title = view === 'dashboard' ? (isAdmin ? 'Dashboard' : 'Home') : view === 'book' ? (isAdmin ? 'Issue ticket' : 'Book ticket') : view === 'network' ? 'Metro network' : view === 'users' ? 'Users' : view === 'admin' ? 'Admin controls' : isAdmin ? 'Tickets' : 'My tickets';

  useEffect(() => {
    if (bookingFareMatch && !bookingFare) setBookingFare(Number(bookingFareMatch.baseFare).toFixed(2));
  }, [bookingFareMatch, bookingFare]);

  async function submitBooking(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (bookingFrom === bookingTo) {
      notify('Choose two different stations.', true);
      return;
    }
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const now = new Date();
    const fare = findFare(bookingFrom, bookingTo);
    const ticket = {
      ticketId: `T-${Date.now().toString().slice(-8)}`,
      passengerId: isAdmin ? form.get('passengerId') : currentUser.userId,
      fareId: fare?.fareId || '',
      sourceStationId: bookingFrom,
      destStationId: bookingTo,
      ticketType: bookingType,
      validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
      isUsed: false,
      issueTime: now.toISOString().slice(0, 19),
      createdAt: now.toISOString().slice(0, 19)
    };
    try {
      const created = await api('tickets', { method: 'POST', body: JSON.stringify(ticket) });
      const amount = Number(form.get('amount') || fare?.baseFare || 0);
      let payment = null;
      if (amount > 0) {
        payment = await api('payments', {
          method: 'POST',
          body: JSON.stringify({ paymentId: `P-${Date.now().toString().slice(-8)}`, ticketId: created.ticketId, amount, createdAt: ticket.createdAt })
        });
      }
      setData((old) => ({ ...old, tickets: [...old.tickets, created], payments: payment ? [...old.payments, payment] : old.payments }));
      formElement.reset();
      setBookingFrom('');
      setBookingTo('');
      setBookingType('SINGLE');
      setBookingFare('');
      navigate('tickets');
      notify('Ticket issued successfully');
    } catch (error) {
      notify(`Ticket could not be issued: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  }

  async function deleteTicket(ticketId) {
    if (!window.confirm(`Delete ticket ${ticketId}?`)) return;
    try {
      await api(`tickets/${encodeURIComponent(ticketId)}`, { method: 'DELETE' });
      setData((old) => ({ ...old, tickets: old.tickets.filter((ticket) => ticket.ticketId !== ticketId) }));
      notify('Ticket deleted');
    } catch (error) {
      notify(`Ticket could not be deleted: ${error.message}`, true);
    }
  }

  async function submitStation(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const station = await api('stations', { method: 'POST', body: JSON.stringify({
        stationId: form.get('stationId').trim(), stationCode: form.get('stationCode').trim(), address: form.get('address').trim(),
        lineColor: form.get('lineColor'), openedDate: new Date().toISOString().slice(0, 10), isActive: true
      }) });
      setData((old) => ({ ...old, stations: [...old.stations, station] }));
      formElement.reset();
      notify('Station saved');
    } catch (error) {
      notify(`Could not save station: ${error.message}`, true);
    }
  }

  async function submitFare(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const fare = await api('fares', { method: 'POST', body: JSON.stringify({
        fareId: form.get('fareId').trim(), sourceStationId: form.get('sourceStationId'),
        destStationId: form.get('destStationId'), baseFare: Number(form.get('baseFare'))
      }) });
      setData((old) => ({ ...old, fares: [...old.fares, fare] }));
      formElement.reset();
      notify('Fare saved');
    } catch (error) {
      notify(`Could not save fare: ${error.message}`, true);
    }
  }

  async function submitUser(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const [firstName, ...rest] = form.get('name').trim().split(' ');
    try {
      const user = await api('users', { method: 'POST', body: JSON.stringify({
        userId: form.get('userId').trim(), firstName, lastName: rest.join(' '), contact: form.get('contact').trim(),
        role: form.get('role'), password: form.get('password'), registrationDate: new Date().toISOString().slice(0, 10), isActive: true
      }) });
      setData((old) => ({ ...old, users: [...old.users, user] }));
      formElement.reset();
      notify('User saved');
    } catch (error) {
      notify(`Could not save user: ${error.message}`, true);
    }
  }

  if (!currentUser) return <><AuthScreen onSignIn={signIn} onSignUp={signUp} />{toast && <div className={`toast ${toast.isError ? 'error' : ''}`} role={toast.isError ? 'alert' : 'status'}>{toast.message}</div>}</>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <Brand link />
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Workspace navigation">
          {NAV_ITEMS[isAdmin ? 'admin' : 'passenger'].map(([key, label]) => <a key={key} className={`nav-item ${view === key ? 'active' : ''}`} href={`#${key}`} onClick={(event) => { event.preventDefault(); navigate(key); }}><Icon name={key === 'tickets' ? 'tickets' : key} /><span>{label}</span>{key === 'tickets' && ticketPool.length > 0 && <span className="nav-count">{ticketPool.length}</span>}</a>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-status"><span className="live-dot" /><div><strong>Network operational</strong><small>All lines are running</small></div></div>
          <div className="account-box"><span className={`role-badge ${isAdmin ? 'admin-role' : ''}`}>{isAdmin ? 'ADMIN' : 'PASSENGER'}</span><div className="account-details"><span className="avatar">{displayName(currentUser).slice(0, 1).toUpperCase()}</span><div><strong>{displayName(currentUser)}</strong><small>{currentUser.userId}</small></div></div><button className="signout-button" type="button" onClick={signOut}>Sign out <span aria-hidden="true">↗</span></button></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button>
          <div><p className="topbar-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h2>{title}</h2></div>
          <button className="primary-action top-action" type="button" onClick={() => navigate('book')}><span>+</span>{isAdmin ? 'Issue a ticket' : 'Book a ride'}</button>
        </header>

        {view === 'dashboard' && <section className="view">
          <div className={`hero-band ${isAdmin ? 'admin-hero' : ''}`}>
            <div className="hero-content"><span className="eyebrow light-eyebrow"><span className="live-dot" /> YOUR CITY, CONNECTED</span><h1>{isAdmin ? <>The whole network.<br />At your fingertips.</> : <>A better ride starts,<br />{currentUser.firstName || currentUser.userId}.</>}</h1><p>{isAdmin ? 'Keep an eye on your stations, riders, and ticket activity — all in one place.' : 'Plan a trip, check your fare, and keep your next journey just a tap away.'}</p><button className="hero-action" type="button" onClick={() => navigate(isAdmin ? 'network' : 'book')}>{isAdmin ? 'Explore the network' : 'Plan your journey'} <Icon name="arrow" /></button></div>
            <div className="hero-art" aria-hidden="true"><div className="hero-art-glow" /><div className="hero-route route-blue" /><div className="hero-route route-orange" /><div className="hero-route route-green" /><span className="hero-station station-a">CEN</span><span className="hero-station station-b">UNI</span><span className="hero-station station-c">AIR</span><span className="hero-station station-d">MKT</span><div className="hero-floating-card"><span className="live-dot" /><span>Next stop</span><strong>Central Station</strong><small>Blue Line <i>·</i> 3 min</small></div></div>
          </div>
          <div className="stats-grid">{stats.map(([label, value, hint], index) => <article className={`stat-card stat-${index + 1}`} key={label}><span className="stat-label">{label}</span><strong>{value}</strong><small>{hint}</small><span className="stat-mark" aria-hidden="true">{['↗', '▤', '◎', '◈'][index]}</span></article>)}</div>
          <div className="split-grid">
            <section className="panel journey-panel"><PanelHeading eyebrow="PLAN A JOURNEY" title="Find your fare" /><form className="journey-form" onSubmit={(event) => { event.preventDefault(); if (fareFrom === fareTo) { notify('Choose two different stations.', true); return; } setFareResult({ fare: findFare(fareFrom, fareTo), from: fareFrom, to: fareTo }); }}><Field label="FROM"><SelectStations stations={activeStations} value={fareFrom} onChange={(event) => setFareFrom(event.target.value)} placeholder="Choose a station" required /></Field><button className="swap-button" type="button" aria-label="Swap stations" onClick={() => { setFareFrom(fareTo); setFareTo(fareFrom); }}><Icon name="swap" /></button><Field label="TO"><SelectStations stations={activeStations} value={fareTo} onChange={(event) => setFareTo(event.target.value)} placeholder="Choose a station" required /></Field><button className="dark-action" type="submit">Check fare <Icon name="arrow" /></button></form>{fareResult && <div className={`fare-result ${fareResult.fare ? '' : 'no-fare'}`} aria-live="polite"><span className="fare-result-icon">₹</span><div><strong>{fareResult.fare ? money(fareResult.fare.baseFare) : 'Fare unavailable'}</strong><small>{stationName(fareResult.from)} <span>→</span> {stationName(fareResult.to)}</small></div><span className="fare-result-status">{fareResult.fare ? 'FARE FOUND' : 'NOT AVAILABLE'}</span></div>}</section>
            <section className="panel activity-panel"><PanelHeading eyebrow="FRESH OFF THE LINE" title={isAdmin ? 'Recent tickets' : 'Your recent rides'} action={<button className="text-action" type="button" onClick={() => navigate('tickets')}>View all <Icon name="arrow" /></button>} />{newestTickets.length ? <div className="activity-list">{newestTickets.map((ticket) => <div className="activity-row" key={ticket.ticketId}><span className="activity-icon"><Icon name="train" /></span><div className="activity-copy"><strong>{stationName(ticket.sourceStationId)} <span>→</span> {stationName(ticket.destStationId)}</strong><small>{ticket.ticketId} <i>·</i> {formatDate(ticket.issueTime || ticket.createdAt)}</small></div><span className="fare-chip">{ticket.ticketType || 'SINGLE'}</span></div>)}</div> : <EmptyState>No journeys yet. Your next ride is waiting.</EmptyState>}</section>
          </div>
        </section>}

        {view === 'book' && <section className="view"><div className="page-heading"><span className="eyebrow">THE CITY IS YOURS</span><h2>{isAdmin ? 'Issue a ticket' : 'Where are you headed?'}</h2><p>{isAdmin ? 'Create a passenger ticket and payment record.' : 'Choose your stations and we’ll take care of the rest.'}</p></div><section className="panel booking-panel"><div className="booking-form-wrap"><PanelHeading eyebrow="YOUR TRIP DETAILS" title="Build your journey" /><form className="booking-grid" onSubmit={submitBooking}>{isAdmin && <Field label="PASSENGER"><select name="passengerId" defaultValue="" required><option value="">Choose a passenger</option>{data.users.filter((user) => user.role !== 'ADMIN').map((user) => <option key={user.userId} value={user.userId}>{displayName(user)}</option>)}</select></Field>}<Field label="FROM"><SelectStations stations={activeStations} value={bookingFrom} onChange={(event) => setBookingFrom(event.target.value)} placeholder="Choose a station" required /></Field><Field label="TO"><SelectStations stations={activeStations} value={bookingTo} onChange={(event) => setBookingTo(event.target.value)} placeholder="Choose a station" required /></Field><Field label="TICKET TYPE"><select name="ticketType" value={bookingType} onChange={(event) => setBookingType(event.target.value)}><option value="SINGLE">Single ride</option><option value="DAY_PASS">Day pass</option><option value="RETURN">Return</option></select></Field><Field label="PAYMENT AMOUNT"><div className="amount-field"><span>Rs</span><input name="amount" type="number" min="0" step="0.01" placeholder="Auto fare" value={bookingFare} onChange={(event) => setBookingFare(event.target.value)} required /></div></Field><button className="primary-action issue-action" type="submit" disabled={busy || !bookingFrom || !bookingTo}>{busy ? 'Issuing ticket…' : <>Confirm & issue ticket <Icon name="arrow" /></>}</button></form></div><aside className="ticket-preview"><div className="preview-top"><span className="eyebrow light-eyebrow">JOURNEY PREVIEW</span><span className="preview-ticket-icon"><Icon name="tickets" /></span></div><div className="preview-route"><span>{bookingFrom ? bookingFromName : 'Origin'}</span><div><span className="preview-route-line" /><Icon name="train" /><span className="preview-route-line" /></div><span>{bookingTo ? bookingToName : 'Destination'}</span></div><div className="preview-separator" /><div className="preview-details"><div><small>Ticket type</small><strong>{bookingType.replace('_', ' ')}</strong></div><div><small>Valid for</small><strong>24 hours</strong></div></div><div className="preview-total"><span>YOUR FARE</span><strong>{bookingFare ? money(bookingFare) : '—'}</strong></div><small className="preview-note">{bookingFareMatch ? 'Fare auto-filled from your selected route.' : 'Your fare will appear when a route is selected.'}</small></aside></section></section>}

        {view === 'tickets' && <section className="view"><div className="page-heading"><span className="eyebrow">YOUR JOURNEY HISTORY</span><h2>{isAdmin ? 'Ticket ledger' : 'My tickets'}</h2><p>{isAdmin ? 'Review and manage issued passenger tickets.' : 'Every ride, right where you need it.'}</p></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-wrap"><span className="search-icon">⌕</span><input className="search-input" value={ticketSearch} onChange={(event) => setTicketSearch(event.target.value)} placeholder="Search ticket, passenger, station…" aria-label="Search tickets" /></div><span className="count-label">{visibleTickets.length} {visibleTickets.length === 1 ? 'ticket' : 'tickets'}</span></div>{visibleTickets.length ? <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Passenger</th><th>Journey</th><th>Issued</th><th>Status</th>{isAdmin && <th>Action</th>}</tr></thead><tbody>{visibleTickets.map((ticket) => <tr key={ticket.ticketId}><td><strong>{ticket.ticketId}</strong><small>{ticket.ticketType || 'SINGLE'}</small></td><td>{ticket.passengerId}</td><td><span className="journey-cell">{stationName(ticket.sourceStationId)} <span>→</span> {stationName(ticket.destStationId)}</span></td><td>{formatDate(ticket.issueTime || ticket.createdAt)}</td><td><span className={`badge ${isTicketActive(ticket) ? 'good' : 'muted'}`}><i />{isTicketActive(ticket) ? 'Active' : ticket.isUsed ? 'Used' : 'Expired'}</span></td>{isAdmin && <td><button className="danger-action" type="button" onClick={() => deleteTicket(ticket.ticketId)}>Delete</button></td>}</tr>)}</tbody></table></div> : <EmptyState>{ticketSearch ? 'No tickets match your search.' : 'No tickets here yet.'}</EmptyState>}</section></section>}

        {view === 'network' && <section className="view"><div className="page-heading"><span className="eyebrow">YOUR CITY, CONNECTED</span><h2>Stations & lines</h2><p>Explore the stops and services that keep your city moving.</p></div><div className="network-summary"><span className="live-dot" /> <strong>{activeStations.length} stations online</strong><span>·</span><span>{data.routes.length} active lines</span><span className="summary-spacer" /><span className="count-label">{data.fares.length} fares configured</span></div><div className="network-grid"><section className="panel map-panel"><PanelHeading eyebrow="LIVE NETWORK" title="Metro map" /><div className="network-map"><div className="network-line map-line-blue" /><div className="network-line map-line-orange" /><div className="network-line map-line-green" />{data.stations.map((station, index) => { const coordinates = [[15, 26], [39, 17], [60, 37], [80, 24], [42, 73], [72, 76], [20, 66]]; const point = coordinates[index % coordinates.length]; return <button key={station.stationId} className={`network-station ${selectedStation?.stationId === station.stationId ? 'selected' : ''} ${station.isActive === false ? 'station-offline' : ''}`} type="button" style={{ left: `${point[0]}%`, top: `${point[1]}%`, '--station-color': station.lineColor || '#3067e8' }} onClick={() => setSelectedStation(station)} aria-label={`Show ${station.stationCode || station.stationId}`}><span className="station-dot" /><strong>{station.stationCode || station.stationId}</strong></button>; })}{selectedStation && <div className="map-tooltip"><button type="button" aria-label="Close station details" onClick={() => setSelectedStation(null)}>×</button><span className="eyebrow">STATION DETAILS</span><strong>{selectedStation.stationCode || selectedStation.stationId}</strong><small>{selectedStation.address || 'No address available'}</small><span className={`badge ${selectedStation.isActive === false ? 'muted' : 'good'}`}><i />{selectedStation.isActive === false ? 'Offline' : 'Online'}</span></div>}</div></section><section className="panel stations-panel"><PanelHeading eyebrow="STOP BY STOP" title="Station directory" action={<span className="count-label">{data.stations.length} total</span>} />{data.stations.length ? <div className="stack-list">{data.stations.map((station) => <button className={`stack-item ${selectedStation?.stationId === station.stationId ? 'selected' : ''}`} type="button" key={station.stationId} onClick={() => setSelectedStation(station)}><span className="color-dot" style={{ background: station.lineColor || '#3067e8' }} /><span className="station-item-copy"><strong>{station.stationCode || station.stationId}</strong><small>{station.address || 'No address'}</small></span><span className={`station-status ${station.isActive === false ? 'offline' : ''}`}><i />{station.isActive === false ? 'Offline' : 'Online'}</span></button>)}</div> : <EmptyState>No stations are configured yet.</EmptyState>}</section></div><section className="panel route-list-panel"><PanelHeading eyebrow="SERVICE OVERVIEW" title="Metro lines" />{data.routes.length ? <div className="route-cards">{data.routes.map((route) => <article className="route-card" key={route.routeId}><span className="route-color" style={{ background: route.lineColor || '#3067e8' }} /><div><strong>{route.routeName || route.routeId}</strong><small>{stationName(route.startStationId)} <span>→</span> {stationName(route.endStationId)}</small></div><span className="route-time">{route.estimatedTime ? `${route.estimatedTime} min` : 'Line'} <Icon name="arrow" /></span></article>)}</div> : <EmptyState>No metro lines are configured yet.</EmptyState>}</section></section>}

        {view === 'admin' && isAdmin && <section className="view"><div className="page-heading"><span className="eyebrow">KEEP THINGS MOVING</span><h2>Operations setup</h2><p>Manage your stations, fares, and the people behind the network.</p></div><div className="admin-grid">
          <section className="panel admin-form-panel"><PanelHeading eyebrow="NETWORK SETUP" title="Add a station" /><form className="form-grid" onSubmit={submitStation}><Field label="STATION ID"><input name="stationId" placeholder="ST-NEW" required /></Field><Field label="STATION NAME"><input name="stationCode" placeholder="Central" required /></Field><Field label="ADDRESS"><input name="address" placeholder="Area or terminal" /></Field><Field label="LINE COLOR"><input name="lineColor" type="color" defaultValue="#3067e8" /></Field><button className="dark-action" type="submit">Save station <Icon name="arrow" /></button></form></section>
          <section className="panel admin-form-panel"><PanelHeading eyebrow="PRICING" title="Add a fare" /><form className="form-grid" onSubmit={submitFare}><Field label="FARE ID"><input name="fareId" placeholder="FR-NEW" required /></Field><Field label="FROM"><select name="sourceStationId" defaultValue="" required><option value="">Choose origin</option>{activeStations.map((station) => <option key={station.stationId} value={station.stationId}>{station.stationCode || station.stationId}</option>)}</select></Field><Field label="TO"><select name="destStationId" defaultValue="" required><option value="">Choose destination</option>{activeStations.map((station) => <option key={station.stationId} value={station.stationId}>{station.stationCode || station.stationId}</option>)}</select></Field><Field label="BASE FARE (RS)"><input name="baseFare" type="number" min="0" step="0.01" placeholder="0.00" required /></Field><button className="dark-action" type="submit">Save fare <Icon name="arrow" /></button></form></section>
          <section className="panel admin-form-panel"><PanelHeading eyebrow="TEAM & ACCESS" title="Add a user" /><form className="form-grid" onSubmit={submitUser}><Field label="USER ID"><input name="userId" required /></Field><Field label="FULL NAME"><input name="name" placeholder="First Last" required /></Field><Field label="CONTACT"><input name="contact" type="email" placeholder="name@example.com" /></Field><Field label="ROLE"><select name="role"><option value="USER">Passenger</option><option value="ADMIN">Admin</option></select></Field><Field label="PASSWORD"><input name="password" type="password" defaultValue="password123" required /></Field><button className="dark-action" type="submit">Save user <Icon name="arrow" /></button></form></section>
        </div></section>}

        {view === 'users' && isAdmin && <section className="view"><div className="page-heading"><span className="eyebrow">THE PEOPLE WHO KEEP US MOVING</span><h2>Riders & team</h2><p>Registered passengers and staff accounts in your network.</p></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-wrap"><span className="search-icon">⌕</span><input className="search-input" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search people by name, ID, or role…" aria-label="Search users" /></div><span className="count-label">{visibleUsers.length} {visibleUsers.length === 1 ? 'person' : 'people'}</span></div>{visibleUsers.length ? <div className="table-wrap"><table><thead><tr><th>User</th><th>Contact</th><th>Role</th><th>Registered</th><th>Status</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.userId}><td><div className="user-cell"><span className="avatar">{displayName(user).slice(0, 1).toUpperCase()}</span><span><strong>{displayName(user)}</strong><small>{user.userId}</small></span></div></td><td>{user.contact || '—'}</td><td><span className={`role-badge ${user.role === 'ADMIN' ? 'admin-role' : ''}`}>{user.role || 'USER'}</span></td><td>{formatDate(user.registrationDate)}</td><td><span className={`badge ${user.isActive === false ? 'muted' : 'good'}`}><i />{user.isActive === false ? 'Inactive' : 'Active'}</span></td></tr>)}</tbody></table></div> : <EmptyState>{userSearch ? 'No people match your search.' : 'No registered users yet.'}</EmptyState>}</section></section>}

        <footer className="workspace-footer"><span>MetroPass <i>·</i> Your city in motion</span><span><span className="live-dot" /> All systems operational</span></footer>
      </main>
      {mobileNavOpen && <button className="nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      {toast && <div key={toast.id} className={`toast ${toast.isError ? 'error' : ''}`} role={toast.isError ? 'alert' : 'status'}><span className="toast-mark">{toast.isError ? '!' : '✓'}</span>{toast.message}<button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button></div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
