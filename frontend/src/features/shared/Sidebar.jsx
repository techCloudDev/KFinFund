import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("watchlist");
    navigate("/");
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="KFinFund" />
        <span>KFinFund</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/user/sip">SIP</NavLink>
        <NavLink to="/mutual-fund">Mutual Funds</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/mutual-fund/watchlist">Watchlist</NavLink>
        <NavLink to="/user/profile/report">Reports</NavLink>
        <NavLink to="/user/profile/basic-details">Profile</NavLink>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "inherit",
            textAlign: "left",
            padding: "0",
            width: "100%",
            display: "block",
          }}
        >
          Logout
        </button>
      </nav>

      <div className="upgrade-card">
        <h4>Upgrade to Premium</h4>
        <p>Unlock advanced insights and specialized tools</p>
        <button onClick={() => alert("Premium feature coming soon!")}>
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;