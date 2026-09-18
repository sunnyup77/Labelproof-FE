import { NavLink } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: 'Scan', icon: ScanIcon, exact: true },
  { to: '/history', label: 'History', icon: HistoryIcon, exact: false },
  { to: '/stats', label: 'Dashboard', icon: StatsIcon, exact: false },
];

export function Layout({ children }: LayoutProps) {

  return (
    <div className="layout">
      {/* Animated Background */}
      <div className="animated-bg" aria-hidden="true">
        <div className="animated-bg__flare animated-bg__flare--left" />
        <div className="animated-bg__flare animated-bg__flare--right" />
        <div className="animated-bg__orb animated-bg__orb--1" />
        <div className="animated-bg__orb animated-bg__orb--2" />
        <div className="animated-bg__orb animated-bg__orb--3" />
      </div>

      <header className="layout-nav">
        <div className="nav-inner container">
          {/* Brand */}
          <NavLink to="/" className="nav-brand" aria-label="LabelCheck home">
            <span className="nav-brand-icon text-gradient" aria-hidden="true">⚖</span>
            <span className="nav-brand-name">LabelCheck</span>
            <span className="nav-brand-sub hide-mobile">Legal Metrology Compliance</span>
          </NavLink>

          {/* Nav links */}
          <nav className="nav-links" aria-label="Main navigation">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link--active' : ''}`
                }
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="nav-right">
            <a
              href="https://egazette.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-ref-link hide-mobile"
              title="LMPC Rules 2011 gazette"
            >
              <span>LMPC Rules 2011</span>
              <ExternalLinkIcon />
            </a>
            <div className="nav-avatar">AS</div>
          </div>
        </div>
      </header>

      <main className="layout-main" id="main-content">
        {children}
      </main>

      <footer className="layout-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <LeafIcon />
            <div className="footer-text-stack">
              <span className="footer-text-primary">Promoting fair trade & consumer rights</span>
              <span className="footer-text-secondary">AI for a more transparent marketplace</span>
            </div>
          </div>
          <div className="footer-right">
            <span className="footer-text-primary">LabelCheck</span>
            <span className="footer-text-secondary">SIH2024 | WeMakeDevs x AWS Bharat Builds Tour</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Inline SVG icons ---
function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-pass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="footer-leaf">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
