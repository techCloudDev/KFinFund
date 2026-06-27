import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../../assets/Logo.png";

const NAV_ITEMS = [
  {
    label: "Mutual Funds",
    items: [
      { label: "Browse Funds", to: "/mutual-fund", requiresAuth: false },
      { label: "Top Performers", to: "/mutual-fund?category=top", requiresAuth: false },
      { label: "New Fund Offers", to: "/mutual-fund?category=nfo", requiresAuth: false },
      { label: "Watchlist", to: "/mutual-fund/watchlist", requiresAuth: true },
    ],
  },
  {
    label: "Fund Categories",
    items: [
      { label: "Large Cap", to: "/mutual-fund?category=largecap", requiresAuth: false },
      { label: "Mid Cap", to: "/mutual-fund?category=midcap", requiresAuth: false },
      { label: "Small Cap", to: "/mutual-fund?category=smallcap", requiresAuth: false },
      { label: "Flexi Cap", to: "/mutual-fund?category=flexicap", requiresAuth: false },
      { label: "Liquid Fund", to: "/mutual-fund?category=liquid", requiresAuth: false },
      { label: "Tax Saving (ELSS)", to: "/mutual-fund?category=elss", requiresAuth: false },
      { label: "Commodity", to: "/mutual-fund?category=commodity", requiresAuth: false },
    ],
  },
  {
    label: "My Account",
    items: [
      { label: "Dashboard", to: "/dashboard", requiresAuth: true },
{ label: "My Portfolio", to: "/portfolio", requiresAuth: true },
{ label: "My SIPs", to: "/user/sip", requiresAuth: true },
{ label: "Transactions", to: "/transactions", requiresAuth: true },
{ label: "Profile", to: "/user/profile/basic-details", requiresAuth: true },
    ],
  },
];

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleClick = (item) => {
    setOpen(false);
    if (item.requiresAuth && !localStorage.getItem("token")) {
      navigate("/login");
    } else {
      navigate(item.to);
    }
  };

  return (
    <div
      className={`lp-nav-dropdown${open ? " is-open" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <button
        type="button"
        className="lp-nav-dropdown__trigger"
        style={{
          background: open ? "rgba(139, 92, 246, 0.15)" : "transparent",
          color: open ? "#a78bfa" : "inherit",
          borderRadius: "6px",
          padding: "6px 12px",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {label}
        <span
          style={{
            display: "inline-block",
            marginLeft: "4px",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            height: "8px",
            background: "transparent",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          minWidth: "200px",
          background: "#1e1b4b",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "8px",
          padding: "6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          display: open ? "flex" : "none",
          flexDirection: "column",
          gap: "2px",
          zIndex: 999,
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            onClick={() => handleClick(item)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              color: "#c4b5fd",
              fontSize: "14px",
              cursor: "pointer",
              display: "block",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    onClose();
    if (item.requiresAuth && !localStorage.getItem("token")) {
      navigate("/login");
    } else {
      navigate(item.to);
    }
  };

  return (
    <div className={`lp-mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
      {NAV_ITEMS.map(({ label, items }) => (
        <div key={label} className="lp-mobile-menu__section">
          <div className="lp-mobile-menu__label">{label}</div>
          {items.map((item) => (
            <div
              key={item.label}
              className="lp-mobile-menu__link"
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}
      <Link to="/login" className="lp-btn-nav lp-mobile-menu__cta" style={{ textDecoration: "none", textAlign: "center" }} onClick={onClose}>
        Login
      </Link>
      <Link to="/register" className="lp-btn-nav lp-btn-nav--outline lp-mobile-menu__cta" style={{ textDecoration: "none", textAlign: "center" }} onClick={onClose}>
        Sign Up
      </Link>
    </div>
  );
}

export default function Navbar({ scrollY }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`lp-navbar${scrollY > 10 ? " lp-navbar--scrolled" : ""}`}>
        <div className="lp-navbar__inner">
          <Link
            to="/"
            className="lp-navbar__logo"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div className="lp-navbar__logo-icon" style={{ background: "none", padding: 0, display: "flex", alignItems: "center" }}>
              <img src={logoImg} alt="KfinFund logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
            </div>
            <span className="lp-navbar__logo-text">KfinFund</span>
          </Link>

          <nav className="lp-navbar__nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, items }) => (
              <NavDropdown key={label} label={label} items={items} />
            ))}
          </nav>

          <div className="lp-navbar__actions">
            <Link to="/login" className="lp-btn-nav lp-navbar__cta--desktop" style={{ textDecoration: "none" }}>
              Login
            </Link>
            <Link to="/register" className="lp-btn-nav lp-btn-nav--outline lp-navbar__cta--desktop" style={{ textDecoration: "none" }}>
              Sign Up
            </Link>
            <button
              type="button"
              className={`lp-navbar__hamburger${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}