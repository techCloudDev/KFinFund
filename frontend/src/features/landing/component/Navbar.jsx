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
  // ✅ Calculators — fully public, no login required.
  // Each item goes to a dedicated public route wrapped in PublicLayout
  // so non-logged-in users never see or touch the authenticated sidebar.
  {
    label: "Calculators",
    items: [
      { label: "SIP Calculator", to: "/calculators/sip", requiresAuth: false },
      { label: "Lumpsum Calculator", to: "/calculators/lumpsum", requiresAuth: false },
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
  const [openSection, setOpenSection] = useState(null);

  const handleClick = (item) => {
    onClose();
    setOpenSection(null);
    if (item.requiresAuth && !localStorage.getItem("token")) {
      navigate("/login");
    } else {
      navigate(item.to);
    }
  };

  const toggleSection = (label) => {
    setOpenSection((prev) => (prev === label ? null : label));
  };

  return (
    <div className={`lp-mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open} style={{ padding: 0 }}>
      <div style={{ paddingBottom: "4px" }}>
        {NAV_ITEMS.map(({ label, items }) => {
          const isOpen = openSection === label;
          return (
            <div key={label}>
              {/* ✅ Section heading — full width tap target, chevron rotates on open */}
              <button
                type="button"
                onClick={() => toggleSection(label)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "15px 20px",
                  background: "none", border: "none",
                  borderBottom: "1px solid rgba(139,92,246,0.12)",
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: "13px", fontWeight: "700", color: "#6C3AED",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  textAlign: "left",
                }}
              >
                {label}
                <span style={{
                  fontSize: "16px", color: "#6C3AED", fontWeight: "400",
                  display: "inline-block",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}>▾</span>
              </button>

              {/* ✅ Items — left-aligned with indent, visible only when open */}
              {isOpen && (
                <div style={{ background: "rgba(139,92,246,0.04)", borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
                  {items.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => handleClick(item)}
                      style={{
                        padding: "11px 20px 11px 32px",
                        fontSize: "14px", fontWeight: "500",
                        color: "#4b5563", cursor: "pointer",
                        textAlign: "left",
                        borderBottom: "1px solid rgba(139,92,246,0.06)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#6C3AED"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ Login / Sign Up — fixed at bottom, full width, bigger buttons */}
      <div style={{
        padding: "20px", display: "flex", gap: "12px",
        borderTop: "1px solid rgba(139,92,246,0.15)", marginTop: "8px",
      }}>
        <Link
          to="/login"
          onClick={onClose}
          style={{
            flex: 1, padding: "13px 0", background: "#6C3AED", color: "white",
            border: "none", borderRadius: "999px", fontSize: "15px",
            fontWeight: "700", cursor: "pointer", textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}
        >
          Login
        </Link>
        <Link
          to="/register"
          onClick={onClose}
          style={{
            flex: 1, padding: "13px 0", background: "transparent",
            color: "#6C3AED", border: "2px solid #6C3AED", borderRadius: "999px",
            fontSize: "15px", fontWeight: "700", cursor: "pointer",
            textDecoration: "none", display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "inherit",
          }}
        >
          Sign Up
        </Link>
      </div>
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