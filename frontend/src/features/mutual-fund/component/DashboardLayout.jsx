import { Link, useLocation } from "react-router-dom";
import logoImg from "/logo.png";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";

export default function DashboardLayout({ children, pageTitle = "Dashboard" }) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "SIP", path: "/user/sip" },
    { name: "Mutual Funds", path: "/mutual-fund" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Transactions", path: "/transactions" },
    { name: "Reports", path: "/reports" },
    { name: "Watchlist", path: "/mutual-fund/watchlist" },
    { name: "Profile", path: "/profile" },
    { name: "Support", path: "/help" },
  ];

  return (
    <div className="mf-layout">
      {/* Sidebar Navigation */}
      <aside className="mf-sidebar">
        <Link to="/" className="mf-sidebar-brand">
          <img src={logoImg} alt="KfinFund logo" className="mf-sidebar-logo" />
          <span className="mf-sidebar-title">KfinFund</span>
        </Link>

        <nav className="mf-sidebar-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`mf-sidebar-item ${isActive ? "is-active" : ""}`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        <div className="mf-sidebar-upgrade">
          <div className="mf-sidebar-upgrade-title">Upgrade to Premium</div>
          <div className="mf-sidebar-upgrade-text">
            Unlock advanced insights and specialized tools
          </div>
          <button type="button" className="mf-sidebar-upgrade-btn">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="mf-main-content">
        {/* Top Header */}
        <header className="mf-top-header">
          <h1 className="mf-header-title">{pageTitle}</h1>

          <div className="mf-header-actions">
            {/* Bell Icon with Badge */}
            <div className="mf-header-bell" title="Notifications">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mf-bell-icon"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="mf-header-bell-badge" />
            </div>
            {/* Profile Avatar and Name */}
            <div className="mf-header-profile">
              <Avatar style={{ width: "36px", height: "36px" }}>
                <AvatarImage src="https://github.com/shadcn.png" alt="Suman" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <span className="mf-header-profile-name">Suman</span>
            </div>
          </div>
        </header>

        {/* Children content area */}
        <main className="mf-workspace">{children}</main>
      </div>
    </div>
  );
}
