import React, { useState, useMemo } from "react";
import {
  Camera, Speaker, Tent, Truck, MapPin, Users, Mic2, Lightbulb,
  Search, X, Check, Clock, Star, ChevronRight, LayoutGrid,
  ClipboardList, Plus, Trash2, ArrowLeft, BadgeCheck, Calendar,
  Sun, Moon
} from "lucide-react";

/* ---------------------------------------------------------------
   SAMPLE DATA
---------------------------------------------------------------- */

const CATEGORIES = [
  { id: "media", label: "Media & AV", icon: Speaker, tag: "AV-01" },
  { id: "stage", label: "Stage & Rigging", icon: Tent, tag: "STG-02" },
  { id: "photo", label: "Photographers", icon: Camera, tag: "PHO-03" },
  { id: "vans", label: "Vans & Transport", icon: Truck, tag: "TRN-04" },
  { id: "grounds", label: "Event Grounds", icon: MapPin, tag: "GRD-05" },
  { id: "ushers", label: "Ushers & Crew", icon: Users, tag: "CRW-06" },
  { id: "sound", label: "Sound Engineers", icon: Mic2, tag: "SND-07" },
  { id: "lighting", label: "Lighting", icon: Lightbulb, tag: "LGT-08" },
];

const VENDORS = [
  { id: 1, cat: "media", name: "Northbeam AV Co.", rate: 3800, unit: "day", rating: 4.9, jobs: 212, loc: "Westside Depot", tags: ["LED Wall", "Mixer", "4K Switch"], lead: 24, verified: true },
  { id: 2, cat: "media", name: "ClearCast Media", rate: 2700, unit: "day", rating: 4.6, jobs: 88, loc: "Harbor District", tags: ["Livestream", "PA System"], lead: 48, verified: true },
  { id: 3, cat: "stage", name: "Riser & Rig Stagecraft", rate: 7200, unit: "event", rating: 4.8, jobs: 134, loc: "Industrial Row", tags: ["20x16 Deck", "Truss", "Backdrop"], lead: 72, verified: true },
  { id: 4, cat: "stage", name: "Apex Staging Works", rate: 4900, unit: "event", rating: 4.5, jobs: 67, loc: "North Yard", tags: ["Modular Deck", "Skirting"], lead: 48, verified: false },
  { id: 5, cat: "photo", name: "Halide & Co. Studio", rate: 2300, unit: "day", rating: 5.0, jobs: 301, loc: "Mill District", tags: ["2 Shooters", "Same-day Edit"], lead: 24, verified: true },
  { id: 6, cat: "photo", name: "Lucia Reyes Photography", rate: 1800, unit: "day", rating: 4.7, jobs: 156, loc: "Eastline", tags: ["Drone", "Film Stock"], lead: 24, verified: true },
  { id: 7, cat: "vans", name: "Cartage Logistics Fleet", rate: 1100, unit: "day", rating: 4.6, jobs: 410, loc: "Depot 9", tags: ["12ft Cargo", "Driver Incl."], lead: 12, verified: true },
  { id: 8, cat: "vans", name: "RouteWorks Transport", rate: 750, unit: "day", rating: 4.3, jobs: 92, loc: "South Lot", tags: ["Sprinter Van"], lead: 24, verified: false },
  { id: 9, cat: "grounds", name: "Meridian Field House", rate: 18000, unit: "day", rating: 4.8, jobs: 76, loc: "Meridian Park", tags: ["Cap. 1200", "Power Hookup", "Parking"], lead: 168, verified: true },
  { id: 10, cat: "grounds", name: "The Old Foundry Yard", rate: 11500, unit: "day", rating: 4.4, jobs: 41, loc: "Foundry Row", tags: ["Cap. 600", "Covered"], lead: 168, verified: true },
  { id: 11, cat: "ushers", name: "Frontline Crew Staffing", rate: 220, unit: "hr/person", rating: 4.7, jobs: 198, loc: "City-wide", tags: ["Uniformed", "Earpiece Comms"], lead: 48, verified: true },
  { id: 12, cat: "ushers", name: "Gateway Event Staff", rate: 190, unit: "hr/person", rating: 4.5, jobs: 120, loc: "City-wide", tags: ["Bilingual Avail."], lead: 24, verified: false },
  { id: 13, cat: "sound", name: "Lowend Audio Engineers", rate: 3100, unit: "day", rating: 4.9, jobs: 145, loc: "Studio Block", tags: ["FOH Mix", "Monitor Mix"], lead: 48, verified: true },
  { id: 14, cat: "lighting", name: "Glow State Lighting", rate: 3400, unit: "day", rating: 4.6, jobs: 102, loc: "Westside Depot", tags: ["Moving Heads", "Haze"], lead: 48, verified: true },
];

// Bundles group vendor IDs into a themed package with a discount.
const BUNDLES = [
  {
    id: "b1",
    name: "Wedding Starter",
    tag: "BUN-A",
    desc: "Stage, photography, and front-of-house crew for a full-day ceremony + reception.",
    vendorIds: [3, 5, 11],
    discountPct: 10,
  },
  {
    id: "b2",
    name: "Corporate Offsite",
    tag: "BUN-B",
    desc: "AV setup, transport, and lighting for a one-day company event.",
    vendorIds: [1, 7, 14],
    discountPct: 8,
  },
  {
    id: "b3",
    name: "Festival Ground Pack",
    tag: "BUN-C",
    desc: "Grounds, stage rigging, and sound engineering for outdoor festivals.",
    vendorIds: [9, 3, 13],
    discountPct: 12,
  },
  {
    id: "b4",
    name: "Grad Party Lite",
    tag: "BUN-D",
    desc: "Photographer, ushers, and a transport van — built for smaller gatherings.",
    vendorIds: [6, 12, 8],
    discountPct: 10,
  },
];

function bundleVendors(bundle) {
  return bundle.vendorIds.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean);
}
function bundleRawTotal(bundle) {
  return bundleVendors(bundle).reduce((sum, v) => sum + v.rate, 0);
}
function bundlePrice(bundle) {
  const raw = bundleRawTotal(bundle);
  return Math.round(raw * (1 - bundle.discountPct / 100));
}

// Generates the next N selectable dates starting after the vendor's lead-time offset.
function availableDates(leadHours, count = 10) {
  const out = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const leadDays = Math.ceil(leadHours / 24);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + leadDays + i);
    out.push(d);
  }
  return out;
}

const TIME_SLOTS = ["07:00", "09:00", "12:00", "15:00", "18:00", "20:00"];

function fmtDate(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function leadLabel(hours) {
  if (hours < 24) return `${hours}H`;
  if (hours % 168 === 0) return `${hours / 168}WK`;
  return `${Math.round(hours / 24)}D`;
}

/* ---------------------------------------------------------------
   HELPERS
---------------------------------------------------------------- */

const fmtMoney = (n) => `GH₵${n.toLocaleString()}`;

function catMeta(id) {
  return CATEGORIES.find((c) => c.id === id);
}

/* ---------------------------------------------------------------
   ROOT APP
---------------------------------------------------------------- */

export default function App() {
  const [view, setView] = useState("customer"); // customer | vendor
  const [theme, setTheme] = useState("dark"); // dark | light
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); // [{ vendor, date, time }]
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const [showCart, setShowCart] = useState(false);
  const [pickerVendor, setPickerVendor] = useState(null); // vendor currently being scheduled

  const filtered = useMemo(() => {
    return VENDORS.filter((v) => {
      if (activeCat && v.cat !== activeCat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hit =
          v.name.toLowerCase().includes(q) ||
          v.loc.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [activeCat, query]);

  function isInCart(vendorId) {
    return cart.some((c) => c.vendor.id === vendorId);
  }

  function confirmSchedule(vendor, date, time) {
    setCart((prev) => {
      const next = prev.filter((c) => c.vendor.id !== vendor.id);
      return [...next, { vendor, date, time }];
    });
    setPickerVendor(null);
  }

  function addBundle(bundle) {
    const vendors = bundleVendors(bundle);
    setCart((prev) => {
      const existingIds = new Set(prev.map((c) => c.vendor.id));
      const additions = vendors
        .filter((v) => !existingIds.has(v.id))
        .map((v) => ({ vendor: v, date: null, time: null }));
      return [...prev, ...additions];
    });
  }

  function removeFromCart(vendorId) {
    setCart((prev) => prev.filter((c) => c.vendor.id !== vendorId));
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.delete(vendorId);
      return next;
    });
  }
  function toggleConfirm(vendorId) {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.has(vendorId) ? next.delete(vendorId) : next.add(vendorId);
      return next;
    });
  }

  const total = cart.reduce((sum, c) => sum + c.vendor.rate, 0);

  return (
    <div className="min-h-screen" data-theme={theme} style={ROOT_STYLE}>
      <style>{THEME_CSS}</style>
      <style>{FONT_IMPORT}</style>
      <TopBar
        view={view}
        setView={setView}
        cartCount={cart.length}
        onCartClick={() => setShowCart(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {view === "customer" ? (
        <CustomerView
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          query={query}
          setQuery={setQuery}
          filtered={filtered}
          isInCart={isInCart}
          onSchedule={(vendor) => setPickerVendor(vendor)}
          onAddBundle={addBundle}
          cart={cart}
        />
      ) : (
        <VendorDashboard />
      )}

      {pickerVendor && (
        <SchedulePickerModal
          vendor={pickerVendor}
          existing={cart.find((c) => c.vendor.id === pickerVendor.id)}
          onConfirm={(date, time) => confirmSchedule(pickerVendor, date, time)}
          onClose={() => setPickerVendor(null)}
        />
      )}

      {showCart && (
        <RunOfShowDrawer
          cart={cart}
          total={total}
          confirmedIds={confirmedIds}
          toggleConfirm={toggleConfirm}
          removeFromCart={removeFromCart}
          onEditSchedule={(vendor) => {
            setShowCart(false);
            setPickerVendor(vendor);
          }}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}

// The root needs an inline background/color too (not just the CSS vars block)
// so the very first paint isn't unstyled white before the <style> tag applies.
const ROOT_STYLE = { background: "var(--bg)", color: "var(--text)" };

/* ---------------------------------------------------------------
   THEME DEFINITIONS
   Dark = original "call sheet" look. Light = white-background,
   higher-contrast variant for easier reading.
---------------------------------------------------------------- */

const THEME_CSS = `
  [data-theme="dark"] {
    --bg: #16181D;
    --card: #1C1F26;
    --border: #33363D;
    --border-soft: #262931;
    --text: #F5F0E6;
    --text-muted: #A39C8E;
    --text-soft: #cfc9bc;
    --accent: #FF6B47;
    --accent-text: #16181D;
    --success: #4F9C82;
    --success-fill: #4F9C82;
    --success-text: #0E2018;
  }

  [data-theme="light"] {
    --bg: #FFFFFF;
    --card: #F7F5F0;
    --border: #DCD6C9;
    --border-soft: #E8E3D8;
    --text: #1A1A1A;
    --text-muted: #5C5648;
    --text-soft: #3A372F;
    --accent: #D5391F;
    --accent-text: #FFFFFF;
    --success: #1F6B52;
    --success-fill: #1F6B52;
    --success-text: #FFFFFF;
  }
`;

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  .font-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
  .font-body { font-family: 'Archivo', sans-serif; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
`;

/* ---------------------------------------------------------------
   TOP BAR
---------------------------------------------------------------- */

function TopBar({ view, setView, cartCount, onCartClick, theme, setTheme }) {
  return (
    <header
      className="font-body sticky top-0 z-40 border-b"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center font-mono text-xs font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            ▣
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none tracking-wide">
              CALLSHEET
            </div>
            <div className="font-mono text-[10px] tracking-widest opacity-50 leading-none mt-0.5">
              EVENT PRODUCTION MARKET
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light background" : "Switch to dark background"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
          </button>

          <div
            className="flex rounded-sm border overflow-hidden text-xs font-mono"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setView("customer")}
              className="px-3 py-1.5 transition-colors"
              style={{
                background: view === "customer" ? "var(--text)" : "transparent",
                color: view === "customer" ? "var(--bg)" : "var(--text-muted)",
              }}
            >
              BOOK
            </button>
            <button
              onClick={() => setView("vendor")}
              className="px-3 py-1.5 transition-colors"
              style={{
                background: view === "vendor" ? "var(--text)" : "transparent",
                color: view === "vendor" ? "var(--bg)" : "var(--text-muted)",
              }}
            >
              VENDOR
            </button>
          </div>

          {view === "customer" && (
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              <ClipboardList size={14} />
              RUN OF SHOW
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------
   CUSTOMER VIEW
---------------------------------------------------------------- */

function CustomerView({ activeCat, setActiveCat, query, setQuery, filtered, isInCart, onSchedule, onAddBundle, cart }) {
  return (
    <main className="max-w-6xl mx-auto px-5 pb-24">
      {/* Hero */}
      <section className="py-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="font-mono text-xs tracking-widest opacity-50 mb-3">
          PROD. SHEET — NO. {new Date().getFullYear()}.0622
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.05] mb-3 max-w-2xl">
          Book your crew like you're calling the show.
        </h1>
        <p className="font-body text-sm md:text-base opacity-70 max-w-lg">
          Stage, sound, vans, grounds, photographers, ushers — sourced from
          vetted local vendors. Pick a date per vendor, confirm, done.
        </p>

        {/* Search */}
        <div className="mt-7 max-w-md">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-sm border"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <Search size={15} className="opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendor, gear, or location…"
              className="font-mono text-sm bg-transparent outline-none flex-1 placeholder:opacity-40"
              style={{ color: "var(--text)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="opacity-50 hover:opacity-100">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-8 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-xs tracking-widest opacity-50">PACKAGE BUNDLES</div>
          <div className="font-mono text-xs opacity-40">Pre-grouped crews, discounted</div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {BUNDLES.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              onAdd={() => onAddBundle(b)}
              cart={cart}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="font-mono text-xs tracking-widest opacity-50 mb-4">
          DEPARTMENTS
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <CategoryTile
            label="All"
            tag="ALL"
            icon={LayoutGrid}
            active={activeCat === null}
            onClick={() => setActiveCat(null)}
          />
          {CATEGORIES.map((c) => (
            <CategoryTile
              key={c.id}
              label={c.label}
              tag={c.tag}
              icon={c.icon}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
            />
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="py-4">
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-xs tracking-widest opacity-50">
            {filtered.length} VENDOR{filtered.length !== 1 ? "S" : ""} AVAILABLE
          </div>
          {activeCat && (
            <div className="font-mono text-xs" style={{ color: "var(--accent)" }}>
              {catMeta(activeCat)?.tag}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div
            className="py-16 text-center rounded-sm border font-body"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="font-display text-lg mb-1">No match on the sheet.</div>
            <div className="text-sm opacity-60">
              Try a different department or clear your search.
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                inCart={isInCart(v.id)}
                cartEntry={cart.find((c) => c.vendor.id === v.id)}
                onSchedule={() => onSchedule(v)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function BundleCard({ bundle, onAdd, cart }) {
  const vendors = bundleVendors(bundle);
  const raw = bundleRawTotal(bundle);
  const price = bundlePrice(bundle);
  const allInCart = vendors.every((v) => cart.some((c) => c.vendor.id === v.id));

  return (
    <div
      className="rounded-sm border font-body overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div
        className="flex items-center justify-between px-3.5 py-2 font-mono text-[10px] tracking-wider border-b"
        style={{ borderColor: "var(--border)", color: "var(--accent)" }}
      >
        <span>{bundle.tag}</span>
        <span>{bundle.discountPct}% OFF BUNDLE</span>
      </div>
      <div className="p-4">
        <div className="font-display text-base font-medium mb-1.5">{bundle.name}</div>
        <p className="text-xs opacity-70 mb-3 leading-relaxed">{bundle.desc}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {vendors.map((v) => (
            <span
              key={v.id}
              className="font-mono text-[10px] px-2 py-1 rounded-sm flex items-center gap-1"
              style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {catMeta(v.cat)?.tag} {v.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono">
            <span className="text-lg font-semibold">{fmtMoney(price)}</span>
            <span className="text-xs opacity-40 line-through ml-1.5">{fmtMoney(raw)}</span>
          </div>
          <button
            onClick={onAdd}
            disabled={allInCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors disabled:cursor-default"
            style={{
              background: allInCart ? "var(--success)" : "var(--accent)",
              color: allInCart ? "var(--text)" : "var(--bg)",
            }}
          >
            {allInCart ? (
              <>
                <Check size={13} /> ALL ADDED
              </>
            ) : (
              <>
                <Plus size={13} /> ADD BUNDLE
              </>
            )}
          </button>
        </div>
        <div className="text-[10px] opacity-40 mt-2">
          Each vendor still needs its own date — set times in the Run of Show sheet.
        </div>
      </div>
    </div>
  );
}

function CategoryTile({ label, tag, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3.5 rounded-sm border transition-all font-body group"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active ? "var(--card)" : "transparent",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} style={{ color: active ? "var(--accent)" : "var(--text-muted)" }} />
        <span
          className="font-mono text-[10px] tracking-wider opacity-40 group-hover:opacity-70"
        >
          {tag}
        </span>
      </div>
      <div className="text-sm font-medium" style={{ color: active ? "var(--text)" : "var(--text-soft)" }}>
        {label}
      </div>
    </button>
  );
}

function VendorCard({ vendor, inCart, cartEntry, onSchedule }) {
  const cat = catMeta(vendor.cat);
  const scheduled = cartEntry && cartEntry.date;

  return (
    <div
      className="rounded-sm border font-body overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* label strip */}
      <div
        className="flex items-center justify-between px-3.5 py-2 font-mono text-[10px] tracking-wider border-b"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <span>{cat?.tag}</span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> LEAD {leadLabel(vendor.lead)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="font-display text-base font-medium leading-tight flex items-center gap-1.5">
            {vendor.name}
            {vendor.verified && (
              <BadgeCheck size={14} style={{ color: "var(--success)" }} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs opacity-70 mb-3 font-mono">
          <span className="flex items-center gap-1">
            <Star size={11} fill="var(--accent)" stroke="none" /> {vendor.rating}
          </span>
          <span>{vendor.jobs} jobs</span>
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {vendor.loc}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {vendor.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] px-2 py-1 rounded-sm"
              style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {t}
            </span>
          ))}
        </div>

        {scheduled && (
          <div
            className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-sm font-mono text-[11px]"
            style={{ background: "var(--bg)", border: "1px solid var(--success)", color: "var(--success-text)" }}
          >
            <Calendar size={11} /> {fmtDate(cartEntry.date)} · {cartEntry.time}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="font-mono">
            <span className="text-lg font-semibold">{fmtMoney(vendor.rate)}</span>
            <span className="text-xs opacity-50"> /{vendor.unit}</span>
          </div>
          <button
            onClick={onSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors"
            style={{
              background: inCart ? "var(--success)" : "var(--accent)",
              color: inCart ? "var(--text)" : "var(--bg)",
            }}
          >
            {inCart ? (
              <>
                <Calendar size={13} /> {scheduled ? "EDIT DATE" : "SET DATE"}
              </>
            ) : (
              <>
                <Calendar size={13} /> PICK DATE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCHEDULE PICKER MODAL
---------------------------------------------------------------- */

function SchedulePickerModal({ vendor, existing, onConfirm, onClose }) {
  const dates = useMemo(() => availableDates(vendor.lead, 10), [vendor]);
  const [selectedDate, setSelectedDate] = useState(existing?.date ? new Date(existing.date) : null);
  const [selectedTime, setSelectedTime] = useState(existing?.time || null);

  const canConfirm = selectedDate && selectedTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-sm border font-body"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div className="font-mono text-[10px] tracking-widest opacity-50 mb-1">
              {catMeta(vendor.cat)?.tag} · LEAD TIME {leadLabel(vendor.lead)}
            </div>
            <div className="font-display text-lg font-semibold">{vendor.name}</div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="font-mono text-xs tracking-widest opacity-50 mb-3">SELECT DATE</div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {dates.map((d) => {
              const active = selectedDate && isoDate(selectedDate) === isoDate(d);
              return (
                <button
                  key={isoDate(d)}
                  onClick={() => setSelectedDate(d)}
                  className="px-2 py-2.5 rounded-sm font-mono text-[11px] text-center transition-colors"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg)",
                    color: active ? "var(--bg)" : "var(--text-soft)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {fmtDate(d)}
                </button>
              );
            })}
          </div>

          <div className="font-mono text-xs tracking-widest opacity-50 mb-3">SELECT CALL TIME</div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {TIME_SLOTS.map((t) => {
              const active = selectedTime === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className="px-2 py-2.5 rounded-sm font-mono text-[11px] text-center transition-colors"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg)",
                    color: active ? "var(--bg)" : "var(--text-soft)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] opacity-40 font-body">
            Earliest availability reflects this vendor's {leadLabel(vendor.lead).toLowerCase()} lead time.
          </div>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(selectedDate, selectedTime)}
            className="w-full py-3 rounded-sm font-mono text-sm font-semibold tracking-wide transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            {existing?.date ? "UPDATE BOOKING" : "ADD TO RUN OF SHOW"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   RUN OF SHOW DRAWER (cart)
---------------------------------------------------------------- */

function RunOfShowDrawer({ cart, total, confirmedIds, toggleConfirm, removeFromCart, onEditSchedule, onClose }) {
  const allScheduled = cart.length > 0 && cart.every((c) => c.date);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md h-full flex flex-col font-body"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div className="font-display text-lg font-semibold">Run of Show</div>
            <div className="font-mono text-[10px] tracking-widest opacity-50">
              {cart.length} ITEM{cart.length !== 1 ? "S" : ""} ON SHEET
            </div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList size={28} className="mx-auto mb-3 opacity-30" />
              <div className="font-display text-base mb-1">Sheet is empty.</div>
              <div className="text-sm opacity-60">
                Add vendors from the booking page to build your crew.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart
                .slice()
                .sort((a, b) => {
                  if (!a.date) return 1;
                  if (!b.date) return -1;
                  return new Date(a.date) - new Date(b.date);
                })
                .map((entry, i) => {
                  const v = entry.vendor;
                  const confirmed = confirmedIds.has(v.id);
                  const needsDate = !entry.date;
                  return (
                    <div
                      key={v.id}
                      className="rounded-sm border px-3.5 py-3"
                      style={{
                        borderColor: needsDate ? "var(--accent)" : confirmed ? "var(--success)" : "var(--border)",
                        background: "var(--bg)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-xs opacity-40 mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <div className="font-display text-sm font-medium leading-tight">
                              {v.name}
                            </div>
                            <div className="font-mono text-[10px] opacity-50 mt-0.5">
                              {catMeta(v.cat)?.tag} · {fmtMoney(v.rate)}/{v.unit}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(v.id)}
                          className="opacity-40 hover:opacity-100 hover:text-[var(--accent)] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => onEditSchedule(v)}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-sm font-mono text-[11px] tracking-wide transition-colors"
                        style={{
                          background: "transparent",
                          border: `1px solid ${needsDate ? "var(--accent)" : "var(--border)"}`,
                          color: needsDate ? "var(--accent)" : "var(--text-soft)",
                        }}
                      >
                        <Calendar size={12} />
                        {entry.date ? `${fmtDate(entry.date)} · ${entry.time}` : "SET DATE — REQUIRED"}
                      </button>

                      <button
                        onClick={() => toggleConfirm(v.id)}
                        disabled={needsDate}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-sm font-mono text-[11px] tracking-wide transition-colors disabled:opacity-30"
                        style={{
                          background: confirmed ? "var(--success)" : "transparent",
                          border: confirmed ? "none" : "1px solid var(--border)",
                          color: confirmed ? "var(--text)" : "var(--text-muted)",
                        }}
                      >
                        {confirmed ? (
                          <>
                            <Check size={12} /> CONFIRMED
                          </>
                        ) : (
                          "MARK CONFIRMED"
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3 font-mono text-sm">
              <span className="opacity-60">ESTIMATED TOTAL</span>
              <span className="text-lg font-semibold">{fmtMoney(total)}</span>
            </div>
            <button
              disabled={!allScheduled}
              className="w-full py-3 rounded-sm font-mono text-sm font-semibold tracking-wide disabled:opacity-40"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              REQUEST BOOKINGS
            </button>
            <div className="text-[11px] opacity-40 mt-2 text-center font-body">
              {allScheduled
                ? "Vendors confirm individually based on lead time."
                : "Set a date for every vendor before requesting."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   VENDOR DASHBOARD
---------------------------------------------------------------- */

const SAMPLE_BOOKINGS = [
  { id: "BK-2291", client: "Reyes Wedding Co.", item: "LED Wall + Mixer", date: "Jun 28", status: "pending" },
  { id: "BK-2284", client: "Northside HS Prom", item: "4K Switch", date: "Jul 03", status: "confirmed" },
  { id: "BK-2271", client: "Atlas Corp Offsite", item: "PA System", date: "Jul 11", status: "confirmed" },
  { id: "BK-2260", client: "Mara & Theo", item: "Livestream Rig", date: "Jun 19", status: "completed" },
];

function VendorDashboard() {
  const [tab, setTab] = useState("bookings");

  return (
    <main className="max-w-6xl mx-auto px-5 pb-24 font-body">
      <section className="py-10 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <div className="font-mono text-xs tracking-widest opacity-50 mb-2">VENDOR DESK</div>
          <h1 className="font-display text-3xl font-semibold">Northbeam AV Co.</h1>
          <div className="flex items-center gap-3 mt-2 font-mono text-xs opacity-60">
            <span className="flex items-center gap-1">
              <Star size={11} fill="var(--accent)" stroke="none" /> 4.9 rating
            </span>
            <span>212 jobs completed</span>
            <span className="flex items-center gap-1" style={{ color: "var(--success)" }}>
              <BadgeCheck size={12} /> Verified
            </span>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          <Plus size={14} /> NEW LISTING
        </button>
      </section>

      <div className="flex gap-1 mt-6 mb-6">
        {[
          { id: "bookings", label: "Bookings" },
          { id: "listings", label: "Listings" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-sm font-mono text-xs tracking-wide transition-colors"
            style={{
              background: tab === t.id ? "var(--card)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--text-muted)",
              border: `1px solid ${tab === t.id ? "var(--border)" : "transparent"}`,
            }}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "bookings" ? <VendorBookings /> : <VendorListings />}
    </main>
  );
}

function VendorBookings() {
  const statusColor = {
    pending: "var(--accent)",
    confirmed: "var(--success)",
    completed: "var(--text-muted)",
  };
  return (
    <div className="rounded-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div
        className="grid grid-cols-12 px-4 py-2.5 font-mono text-[10px] tracking-widest opacity-50 border-b"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="col-span-2">ID</div>
        <div className="col-span-4">CLIENT</div>
        <div className="col-span-3">ITEM</div>
        <div className="col-span-2">DATE</div>
        <div className="col-span-1 text-right">STATUS</div>
      </div>
      {SAMPLE_BOOKINGS.map((b) => (
        <div
          key={b.id}
          className="grid grid-cols-12 px-4 py-3.5 font-mono text-xs items-center border-b last:border-b-0"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="col-span-2 opacity-60">{b.id}</div>
          <div className="col-span-4 font-body text-sm" style={{ color: "var(--text)" }}>
            {b.client}
          </div>
          <div className="col-span-3 opacity-70">{b.item}</div>
          <div className="col-span-2 opacity-70 flex items-center gap-1">
            <Calendar size={11} /> {b.date}
          </div>
          <div className="col-span-1 text-right">
            <span style={{ color: statusColor[b.status] }}>● {b.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function VendorListings() {
  const mine = VENDORS.filter((v) => v.id === 1 || v.id === 14);
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {mine.map((v) => (
        <VendorCard key={v.id} vendor={v} inCart={false} cartEntry={null} onSchedule={() => {}} />
      ))}
      <button
        className="rounded-sm border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 font-body opacity-50 hover:opacity-80 transition-opacity"
        style={{ borderColor: "var(--border)" }}
      >
        <Plus size={20} />
        <span className="text-sm">Add another listing</span>
      </button>
    </div>
  );
}
