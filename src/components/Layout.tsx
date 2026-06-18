import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/',        label: 'Home' },
  { to: '/games',   label: 'Games' },
  { to: '/players', label: 'Roster' },
];

const GEA_LOGO = 'https://www.gretnaeliteacademy.com/wp-content/uploads/2019/03/Gretna-Elite-Academy-Color-RGB-white-solid-1.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gea-cream">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-gea-black sticky top-0 z-40 border-b-2 border-gea-gold">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={GEA_LOGO}
              alt="Gretna Elite Academy"
              className="h-10 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="hidden sm:block leading-tight">
              <div
                className="text-white text-sm font-display font-bold uppercase tracking-widest leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                U11 · 9v9
              </div>
              <div
                className="text-gea-gold text-xs font-display uppercase tracking-wider"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Match Tracker
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0">
            {NAV.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-5 h-16 flex items-center text-sm font-display font-medium uppercase tracking-wider transition-colors ${
                    active
                      ? 'text-gea-gold'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gea-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden bg-gea-black border-t border-white/10">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`block px-6 py-3 text-sm font-display uppercase tracking-wider border-b border-white/5 ${
                  pathname === to ? 'text-gea-gold' : 'text-white/70'
                }`}
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────────── */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gea-black border-t-2 border-gea-gold py-8 mt-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={GEA_LOGO} alt="" className="h-10 w-auto opacity-80" />
          <div
            className="text-white/40 text-xs font-display uppercase tracking-widest text-center"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            Gretna Elite Academy · U11 · Players First
          </div>
        </div>
      </footer>
    </div>
  );
}
