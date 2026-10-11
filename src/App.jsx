import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const categories = [
  "All requests",
  "Errands",
  "Companionship",
  "Food & essentials",
  "Skills & learning",
  "Transportation",
  "Other",
];
const categoryIcons = {
  Errands: "🛍️",
  Companionship: "☕",
  "Food & essentials": "🥕",
  "Skills & learning": "📚",
  Transportation: "🚲",
  Other: "🤝",
};
const categoryColors = {
  Errands: "peach",
  Companionship: "lavender",
  "Food & essentials": "sage",
  "Skills & learning": "blue",
  Transportation: "yellow",
  Other: "rose",
};

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.details = data.errors || {};
    throw error;
  }
  return data;
}

function dateLabel(value) {
  if (!value) return "Whenever works";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

function App() {
  const [needs, setNeeds] = useState([]);
  const [stats, setStats] = useState({ openNeeds: 0, volunteerOffers: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All requests");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadNeeds = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All requests") params.set("category", activeCategory);
      if (search.trim()) params.set("search", search.trim());
      const data = await request(`/api/needs?${params.toString()}`);
      setNeeds(data.needs);
      setStats(data.stats);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const timer = window.setTimeout(loadNeeds, 250);
    return () => window.clearTimeout(timer);
  }, [loadNeeds]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const featuredNeed = useMemo(
    () => needs.find((need) => need.urgency === "Today") || needs[0],
    [needs],
  );
  const listNeeds = useMemo(
    () => needs.filter((need) => need.id !== featuredNeed?.id),
    [needs, featuredNeed],
  );

  async function handleCreateNeed(values) {
    const result = await request("/api/needs", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setToast(result.message);
    setModal(null);
    setActiveCategory("All requests");
    setSearch("");
  }

  async function handleVolunteer(need, values) {
    const result = await request(`/api/needs/${need.id}/volunteer`, {
      method: "POST",
      body: JSON.stringify(values),
    });
    setToast(result.message);
    setModal(null);
    await loadNeeds();
  }

  function goToRequests() {
    setMobileNavOpen(false);
    document.getElementById("requests")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Neighborly home">
          <span className="brand-mark"><Heart size={19} strokeWidth={2.4} /></span>
          <span>neighborly<span className="brand-period">.</span></span>
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`nav-links ${mobileNavOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <button className="nav-link nav-active" type="button" onClick={goToRequests}>Community board</button>
          <a className="nav-link" href="#how-it-works" onClick={() => setMobileNavOpen(false)}>How it works</a>
          <button className="button button-dark nav-cta" type="button" onClick={() => { setModal({ type: "need" }); setMobileNavOpen(false); }}>
            <Plus size={16} /> Ask for a hand
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> GOOD TO HAVE YOU HERE</div>
            <h1>A little help<br />goes a <span className="headline-mark">long way<span className="headline-period">.</span></span></h1>
            <p className="hero-description">If you’re here to lend a hand or looking for one, you’re in the right place. We’re glad you found us.</p>
            <div className="hero-actions">
              <button className="button button-dark button-large" type="button" onClick={goToRequests}>
                Find a way to help <ArrowRight size={17} />
              </button>
              <button className="button button-text" type="button" onClick={() => setModal({ type: "need" })}>
                Ask for help <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="neighbor-proof">
              <span className="neighbor-note-mark" aria-hidden="true"><Heart size={16} /></span>
              <p><strong>You don’t need special skills.</strong><br />A little time and a kind hello can mean a lot.</p>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of neighbors helping one another">
            <div className="art-sun" />
            <div className="art-doodle doodle-heart">♡</div>
            <div className="art-doodle doodle-spark">✳</div>
            <div className="art-path" />
            <div className="plant plant-left"><i /><i /><i /><b /></div>
            <div className="plant plant-right"><i /><i /><i /><b /></div>
            <div className="person person-left">
              <div className="person-head"><span /></div><div className="person-body" /><div className="person-leg leg-left" /><div className="person-leg leg-right" />
            </div>
            <div className="person person-right">
              <div className="person-head"><span /></div><div className="person-body" /><div className="person-leg leg-left" /><div className="person-leg leg-right" />
            </div>
            <div className="help-bag"><span>✿</span></div>
            <div className="art-caption"><span className="caption-icon"><Heart size={15} fill="currentColor" /></span><span><strong>Kindness lives here</strong><small>One neighbor at a time</small></span></div>
            <span className="art-label label-top">NEIGHBORHOOD<br />LOVE, IN ACTION</span>
            <span className="art-label label-bottom">GOOD THINGS<br />GROW TOGETHER</span>
          </div>
        </section>

        <section className="impact-bar" aria-label="Community impact">
          <div className="impact-intro"><span className="impact-icon"><Sparkles size={17} /></span><span>Neighbors helping neighbors</span></div>
          <div className="impact-stat"><strong>{stats.openNeeds}</strong><span>open requests</span></div>
          <div className="impact-divider" />
          <div className="impact-stat"><strong>{stats.volunteerOffers}</strong><span>offers to help</span></div>
          <div className="impact-note">Little things mean a lot <ArrowDownRight size={17} /></div>
        </section>

        <section className="board-section" id="requests">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow"><span className="eyebrow-dot" /> THE COMMUNITY BOARD</div>
              <h2>Ways to show up<span className="headline-period">.</span></h2>
              <p>From a bazar run to a friendly chat, see if there’s something you can help with.</p>
            </div>
            <button className="button button-outline" type="button" onClick={() => setModal({ type: "need" })}>
              <Plus size={17} /> Post a request
            </button>
          </div>

          <div className="board-controls">
            <div className="category-scroll" role="tablist" aria-label="Filter requests by category">
              {categories.map((category) => (
                <button
                  className={`category-tab ${activeCategory === category ? "category-tab-active" : ""}`}
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “bazar” or “Mirpur”" aria-label="Search requests" />
            </label>
          </div>

          {loadError ? (
            <div className="notice notice-error" role="alert">
              <div><strong>We can’t reach the community board just now.</strong><span>Make sure the app and XAMPP MySQL are running, then give it another try. Details: {loadError}</span></div>
              <button className="button button-outline" type="button" onClick={loadNeeds}>Try again</button>
            </div>
          ) : loading ? (
            <div className="loading-grid" aria-label="Loading community requests">
              <span /><span /><span />
            </div>
          ) : needs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Heart size={24} /></span>
              <h3>{activeCategory !== "All requests" || search.trim() ? "We couldn’t find a match." : "It’s quiet on the board for now."}</h3>
              <p>{activeCategory !== "All requests" || search.trim()
                ? "Try a different search or browse all requests. Your neighbors may have just the right thing."
                : "If a little help would make your day easier, it’s okay to ask. Or come back when you’re ready."}</p>
              {activeCategory !== "All requests" || search.trim() ? (
                <button className="button button-outline" type="button" onClick={() => { setActiveCategory("All requests"); setSearch(""); }}>Show all requests</button>
              ) : (
                <button className="button button-dark" type="button" onClick={() => setModal({ type: "need" })}><Plus size={16} /> Ask your neighbors</button>
              )}
            </div>
          ) : (
            <div className="needs-layout">
              {featuredNeed && (
                <FeaturedCard need={featuredNeed} onVolunteer={() => setModal({ type: "volunteer", need: featuredNeed })} />
              )}
              <div className="request-list">
                {listNeeds.map((need) => (
                  <RequestCard key={need.id} need={need} onVolunteer={() => setModal({ type: "volunteer", need })} />
                ))}
                {listNeeds.length === 0 && (
                  <div className="list-empty">
                    <UsersRound size={22} />
                    <p>That’s all we found for this view. <button type="button" onClick={() => { setActiveCategory("All requests"); setSearch(""); }}>See all requests</button></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-intro">
            <div className="eyebrow"><span className="eyebrow-dot" /> A GOOD PLACE TO START</div>
            <h2>It starts with<br />a simple hello<span className="headline-period">.</span></h2>
            <p>Some days we can help. Some days we need help. Both are part of being neighbors.</p>
          </div>
          <div className="how-steps">
            <article className="how-step"><span className="step-number">01</span><span className="step-icon step-icon-peach"><Search size={20} /></span><h3>See what feels right</h3><p>Take a look around. Even a small gesture can mean a lot to someone nearby.</p></article>
            <article className="how-step"><span className="step-number">02</span><span className="step-icon step-icon-sage"><MessageCircle size={20} /></span><h3>Send a kind note</h3><p>Share how you can help. Your offer is saved with the request, but no email is sent automatically.</p></article>
            <article className="how-step"><span className="step-number">03</span><span className="step-icon step-icon-lavender"><Heart size={20} /></span><h3>Let it be enough</h3><p>There’s no need to change the world. Being there for one person is plenty.</p></article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Heart size={17} strokeWidth={2.4} /></span><span>neighborly<span className="brand-period">.</span></span></a>
        <p>Made with care, for the places we call home.</p>
        <span className="footer-note">A little help goes a long way <Heart size={13} /></span>
      </footer>

      {toast && <div className="toast" role="status"><span><Check size={16} /></span>{toast}<button type="button" aria-label="Dismiss notification" onClick={() => setToast("")}><X size={16} /></button></div>}
      {modal?.type === "need" && <NeedModal onClose={() => setModal(null)} onSubmit={handleCreateNeed} />}
      {modal?.type === "volunteer" && <VolunteerModal need={modal.need} onClose={() => setModal(null)} onSubmit={(values) => handleVolunteer(modal.need, values)} />}
    </div>
  );
}

function CategoryPill({ category }) {
  return <span className={`category-pill pill-${categoryColors[category] || "rose"}`}><span>{categoryIcons[category] || "🤝"}</span>{category}</span>;
}

function Urgency({ value }) {
  return <span className={`urgency urgency-${value.toLowerCase().replace(" ", "-")}`}><span />{value}</span>;
}

function FeaturedCard({ need, onVolunteer }) {
  return (
    <article className="featured-card">
      <div className="featured-top"><CategoryPill category={need.category} /><Urgency value={need.urgency} /></div>
      <div className="featured-main">
        <div className="requester-line"><span className="requester-avatar">{need.requesterName?.[0] || "N"}</span><span>{need.requesterName} <span className="requester-context">could use a hand</span></span></div>
        <h3>{need.title}</h3>
        <p className="featured-description">{need.description}</p>
      </div>
      <div className="request-meta"><span><MapPin size={15} />{need.location}</span><span><CalendarDays size={15} />{dateLabel(need.neededBy)}</span></div>
      <div className="featured-footer">
        <span className="volunteer-count"><UsersRound size={15} /> {need.volunteerCount === 0 ? "Be the first to offer" : `${need.volunteerCount} ${need.volunteerCount === 1 ? "neighbor has" : "neighbors have"} offered`}</span>
        <button className="button button-dark" type="button" onClick={onVolunteer}>I can help <ArrowRight size={16} /></button>
      </div>
    </article>
  );
}

function RequestCard({ need, onVolunteer }) {
  return (
    <article className="request-card">
      <div className="request-card-top"><CategoryPill category={need.category} /><Urgency value={need.urgency} /></div>
      <div className="request-card-body">
        <div className="requester-line"><span className="requester-avatar small-avatar">{need.requesterName?.[0] || "N"}</span><span>{need.requesterName} could use a hand</span></div>
        <h3>{need.title}</h3>
        <p>{need.description}</p>
      </div>
      <div className="request-card-bottom">
        <div className="compact-meta"><span><MapPin size={14} />{need.location}</span><span><Clock3 size={14} />{dateLabel(need.neededBy)}</span></div>
        <button className="text-link" type="button" onClick={onVolunteer}>Offer to help <ArrowUpRight size={15} /></button>
      </div>
    </article>
  );
}

const initialNeed = { title: "", description: "", category: "Errands", location: "", requesterName: "", contactEmail: "", neededBy: "", urgency: "Whenever" };
const initialVolunteer = { volunteerName: "", volunteerEmail: "", message: "" };

function ModalShell({ title, description, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        <div className="modal-heading"><span className="modal-icon"><Heart size={18} /></span><div><h2 id="modal-title">{title}</h2><p>{description}</p></div></div>
        {children}
      </section>
    </div>
  );
}

function FormField({ label, name, error, children, className = "" }) {
  return <label className={`form-field ${className}`}><span className="field-label">{label}</span>{children}{error && <span className="field-error">{error}</span>}</label>;
}

function NeedModal({ onClose, onSubmit }) {
  const [values, setValues] = useState(initialNeed);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit({ ...values, neededBy: values.neededBy || null });
    } catch (error) {
      setErrors(error.details || {});
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Ask your neighbors" description="Asking can feel like a big step. Share only what you’re comfortable sharing." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="What would help?" name="title" error={errors.title} className="field-full"><input name="title" value={values.title} onChange={update} placeholder="e.g. A hand picking up groceries" maxLength={120} required /></FormField>
          <FormField label="A little more detail" name="description" error={errors.description} className="field-full"><textarea name="description" value={values.description} onChange={update} placeholder="Share what you need and anything that might help a neighbor offer support." rows={3} maxLength={2000} required /></FormField>
          <FormField label="Category" name="category" error={errors.category}><span className="select-wrap"><select name="category" value={values.category} onChange={update}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={16} /></span></FormField>
          <FormField label="Area or neighborhood" name="location" error={errors.location}><input name="location" value={values.location} onChange={update} placeholder="e.g. Mirpur, Dhanmondi, Chattogram" maxLength={120} required /><span className="field-hint">Add your area and city so nearby neighbors can find you.</span></FormField>
          <FormField label="Your name" name="requesterName" error={errors.requesterName}><input name="requesterName" value={values.requesterName} onChange={update} placeholder="How neighbors know you" maxLength={80} required /></FormField>
          <FormField label="Email for neighbor replies" name="contactEmail" error={errors.contactEmail}><input name="contactEmail" type="email" value={values.contactEmail} onChange={update} placeholder="you@example.com" maxLength={254} required /></FormField>
          <FormField label="When would help?" name="urgency" error={errors.urgency}><span className="select-wrap"><select name="urgency" value={values.urgency} onChange={update}><option>Whenever</option><option>This week</option><option>Today</option></select><ChevronDown size={16} /></span></FormField>
          <FormField label="Preferred date (optional)" name="neededBy" error={errors.neededBy}><input name="neededBy" type="date" value={values.neededBy} onChange={update} /></FormField>
        </div>
        <p className="privacy-note"><Heart size={14} /> Your email stays off the public board. This demo doesn’t send email updates yet.</p>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions"><button className="button button-text" type="button" onClick={onClose}>Maybe later</button><button className="button button-dark" type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post my request"} <ArrowRight size={16} /></button></div>
      </form>
    </ModalShell>
  );
}

function VolunteerModal({ need, onClose, onSubmit }) {
  const [values, setValues] = useState(initialVolunteer);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(error.details || {});
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Offer a helping hand" description={`A kind note can make the first hello easier for ${need.requesterName}.`} onClose={onClose}>
      <div className="volunteer-context"><CategoryPill category={need.category} /><strong>{need.title}</strong><span><MapPin size={14} />{need.location}</span></div>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Your name" name="volunteerName" error={errors.volunteerName}><input name="volunteerName" value={values.volunteerName} onChange={update} placeholder="How neighbors know you" maxLength={80} required /></FormField>
          <FormField label="Your email" name="volunteerEmail" error={errors.volunteerEmail}><input name="volunteerEmail" type="email" value={values.volunteerEmail} onChange={update} placeholder="you@example.com" maxLength={254} required /></FormField>
          <FormField label="Add a note (optional)" name="message" error={errors.message} className="field-full"><textarea name="message" value={values.message} onChange={update} placeholder="A friendly hello goes a long way." rows={3} maxLength={500} /></FormField>
        </div>
        <p className="privacy-note"><Heart size={14} /> Your email stays off the public board. This demo doesn’t send email updates yet.</p>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions"><button className="button button-text" type="button" onClick={onClose}>Not right now</button><button className="button button-dark" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send my offer"} <ArrowRight size={16} /></button></div>
      </form>
    </ModalShell>
  );
}

export default App;
