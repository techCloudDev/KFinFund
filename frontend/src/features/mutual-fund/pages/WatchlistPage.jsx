import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../component/DashboardLayout";
import "../mutual-fund.css";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist items on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("watchlist");
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    }
  }, []);

  const handleRemove = (code) => {
    const updated = watchlist.filter(item => String(item.code) !== String(code));
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  return (
    <DashboardLayout pageTitle="Watchlist">
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "var(--mf-text-muted)", margin: 0, fontSize: "15px", fontWeight: "500" }}>
          Monitor your favorite mutual funds for easy access and quick investing.
        </p>
        <button
          onClick={() => navigate("/mutual-fund")}
          style={{
            backgroundColor: "var(--mf-accent-purple)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "var(--mf-accent-purple-hover)"}
          onMouseOut={(e) => e.target.style.backgroundColor = "var(--mf-accent-purple)"}
        >
          Browse Funds
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div 
          className="mf-empty-state" 
          style={{ 
            backgroundColor: "#FFFFFF", 
            border: "1px solid var(--mf-border-color)", 
            borderRadius: "14px", 
            padding: "60px 20px", 
            textAlign: "center" 
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🔖</div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--mf-text-dark)", margin: "0 0 8px 0" }}>Your Watchlist is Empty</h3>
          <p style={{ color: "var(--mf-text-muted)", fontSize: "14px", margin: "0 0 24px 0", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            Start bookmarking mutual funds from the explore page to track their daily NAV performance and CAGR returns.
          </p>
          <button
            onClick={() => navigate("/mutual-fund")}
            style={{
              backgroundColor: "var(--mf-accent-purple)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Explore Mutual Funds
          </button>
        </div>
      ) : (
        <div className="mf-table-container">
          <table className="mf-table">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Latest NAV</th>
                <th>3Y CAGR</th>
                <th>Risk Category</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((fund) => (
                <tr key={fund.code}>
                  <td>
                    <div
                      className="mf-table-logo-box"
                      onClick={() => navigate(`/mutual-fund/${fund.code}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={fund.logo} alt={fund.name} className="mf-table-logo" />
                      <span style={{ fontWeight: 600 }}>{fund.name}</span>
                    </div>
                  </td>
                  <td>₹{(fund.currentNav || 0).toFixed(2)}</td>
                  <td style={{ color: (fund.cagr3Y || 0) >= 0 ? "#10B981" : "#EF4444", fontWeight: "600" }}>
                    {fund.cagr3Y !== undefined ? `${fund.cagr3Y}%` : "--"}
                  </td>
                  <td>
                    <span className={`mf-badge mf-badge-${(fund.risk || "High").toLowerCase()}`}>
                      {fund.risk || "High"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                      <button
                        onClick={() => navigate(`/mutual-fund/${fund.code}`)}
                        style={{
                          backgroundColor: "rgba(108, 58, 237, 0.08)",
                          color: "var(--mf-accent-purple)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        Invest
                      </button>
                      <button
                        onClick={() => handleRemove(fund.code)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#EF4444",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Remove from Watchlist"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
