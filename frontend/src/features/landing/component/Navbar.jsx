import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoImg from "../../../assets/Logo.png";

const NAV_ITEMS = [
  {
    label: "Mutual Funds",
    items: ["Start Investment", "My Portfolio", "STP", "Return Calculator", "Taxes"],
  },
  {
    label: "Fund Categories",
    items: ["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Liquid Fund", "Tax Saving (ELSS)", "Commodity"],
  },
  {
    label: "Features",
    items: ["Portfolio Analysis", "Register with PAN", "Smart Alerts", "Multiple Bank Accounts", "Watchlist"],
  },
];

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`lp-nav-dropdown${open ? " is-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" className="lp-nav-dropdown__trigger">
        {label}
        <span className="lp-nav-dropdown__chevron">▾</span>
      </button>

      <div className="lp-nav-dropdown__menu">
        {items.map((item) => (
          <a key={item} href="#" className="lp-nav-dropdown__link">
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  return (
    <div className={`lp-mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
      {NAV_ITEMS.map(({ label, items }) => (
        <div key={label} className="lp-mobile-menu__section">
          <div className="lp-mobile-menu__label">{label}</div>
          {items.map((item) => (
            <a key={item} href="#" className="lp-mobile-menu__link" onClick={onClose}>
              {item}
            </a>
          ))}
        </div>
      ))}
      <Link to="/login" className="lp-btn-nav lp-mobile-menu__cta" style={{ textDecoration: 'none', textAlign: 'center' }} onClick={onClose}>
        Login
      </Link>
      <Link to="/register" className="lp-btn-nav lp-btn-nav--outline lp-mobile-menu__cta" style={{ textDecoration: 'none', textAlign: 'center' }} onClick={onClose}>
        Sign Up
      </Link>
    </div>
  );
}

export default function Navbar({ scrollY }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`lp-navbar${scrollY > 10 ? " lp-navbar--scrolled" : ""}`}>
        <div className="lp-navbar__inner">
          <Link to="/" className="lp-navbar__logo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="lp-navbar__logo-icon" style={{ background: "none", padding: 0, display: "flex", alignItems: "center" }}>
              <img src={logoImg} alt="KfinFund logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            </div>
            <span className="lp-navbar__logo-text">KfinFund</span>
          </Link>

          <nav className="lp-navbar__nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, items }) => (
              <NavDropdown key={label} label={label} items={items} />
            ))}
          </nav>

          <div className="lp-navbar__actions">
            <Link to="/login" className="lp-btn-nav lp-navbar__cta--desktop" style={{ textDecoration: 'none' }}>
              Login
            </Link>

            <Link to="/register" className="lp-btn-nav lp-btn-nav--outline lp-navbar__cta--desktop" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>

            <button
              type="button"
              className={`lp-navbar__hamburger${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
