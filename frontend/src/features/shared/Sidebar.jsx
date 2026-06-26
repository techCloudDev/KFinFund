import { NavLink } from "react-router-dom";
import "./layout.css";

function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="KFinFund" />
        <span>KFinFund</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/sip">SIP</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/watchlist">Watchlist</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        <NavLink to="/login">Logout</NavLink>
      </nav>

      <div className="upgrade-card">
        <h4>Upgrade to Premium</h4>
        <p>Unlock advanced insights</p>
        <button onClick={() => alert("Premium feature coming soon")}>
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;