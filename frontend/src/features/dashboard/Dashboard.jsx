import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import "./dashboard.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";
const SIP_SERVICE_URL = import.meta.env.VITE_SIP_API || "http://localhost:4004";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransactionPanel, setShowTransactionPanel] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("thisMonth");
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sips, setSips] = useState([]);
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState([]);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["S","M","T","W","T","F","S"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const tokenData = getTokenData();
    if (tokenData?.email) setUserName(tokenData.email.split("@")[0]);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/portfolio`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        // Generate real notifications based on portfolio
        const notifs = [];
        if (data?.totalInvestment > 0) {
          notifs.push({ icon: "📈", text: `Your portfolio value is ₹${Number(data.totalInvestment * 1.19).toLocaleString("en-IN")}` });
        }
        setNotifications(notifs);
      })
      .catch(() => setPortfolio(null));

    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const txns = data.transactions || [];
        setTransactions(txns);
        if (txns.length > 0) {
          setNotifications(prev => [...prev, { icon: "✅", text: `You have ${txns.length} transaction${txns.length > 1 ? "s" : ""}` }]);
        }
      })
      .catch(() => setTransactions([]));

    fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const sipList = Array.isArray(data) ? data : [];
        setSips(sipList);
        const activeSipList = sipList.filter(s => s.status === "ACTIVE");
        if (activeSipList.length > 0) {
          setNotifications(prev => [...prev, { icon: "📅", text: `${activeSipList.length} active SIP${activeSipList.length > 1 ? "s" : ""} running` }]);
        }
      })
      .catch(() => setSips([]));
  }, []);

  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedCalendarMonth, 1).getDay();
    const totalDays = new Date(selectedYear, selectedCalendarMonth + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  };

  const chartData = {
    thisMonth: [
      { label: "May 01", value: 25000 }, { label: "May 05", value: 60000 },
      { label: "May 09", value: 110000 }, { label: "May 13", value: 125000 },
      { label: "May 17", value: 145000 }, { label: "May 21", value: 160000 },
      { label: "May 25", value: 182000 }, { label: "May 31", value: 210000 },
    ],
    lastMonth: [
      { label: "Apr 01", value: 18000 }, { label: "Apr 05", value: 29000 },
      { label: "Apr 09", value: 68000 }, { label: "Apr 13", value: 82000 },
      { label: "Apr 17", value: 88000 }, { label: "Apr 21", value: 99000 },
      { label: "Apr 25", value: 132000 }, { label: "Apr 30", value: 158000 },
    ],
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const currentChart = selectedMonth === "custom" ? chartData.thisMonth : chartData[selectedMonth];
  const chartWidth = currentChart.length * 90;
  const maxValue = 220000;
  const minY = 28;
  const maxY = 175;

  const scaledPoints = currentChart.map((item, index) => ({
    ...item,
    x: index * 90 + 45,
    y: maxY - (item.value / maxValue) * (maxY - minY),
  }));

  const chartPoints = scaledPoints.map(p => `${p.x},${p.y}`).join(" ");
  const firstPoint = scaledPoints[0];
  const lastPoint = scaledPoints[scaledPoints.length - 1];
  const chartArea = `${chartPoints} ${lastPoint.x},190 ${firstPoint.x},190`;

  const formatChartValue = (value) =>
    value >= 100000 ? `${(value / 100000).toFixed(1)}L` : `${Math.round(value / 1000)}K`;

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const totalInvestment = portfolio?.totalInvestment || 0;
  const currentValue = totalInvestment * 1.19;
  const totalGain = currentValue - totalInvestment;
  const gainPercent = totalInvestment > 0 ? ((totalGain / totalInvestment) * 100).toFixed(2) : "0.00";

  const activeSips = sips.filter(s => s.status === "ACTIVE");
  const nextSip = activeSips[0];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content" style={{ overflowY: "auto" }}>
        <div className="dashboard-header">
          <div>
            <h1>{greeting}, {userName}! 👋</h1>
            <p>Here's what's happening with your investments today.</p>
          </div>

          <div className="user-box">
            {/* Bell with red dot if notifications exist */}
            <div style={{ position: "relative" }}>
              <button className="bell-btn" onClick={() => setShowNotifications(!showNotifications)}>🔔</button>
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute", top: "0", right: "0",
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#EF4444", border: "1.5px solid white"
                }} />
              )}
            </div>

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                {notifications.length > 0
                  ? notifications.map((n, i) => <p key={i}>{n.icon} {n.text}</p>)
                  : <p style={{ color: "#9ca3af", fontSize: "13px" }}>No new notifications</p>
                }
              </div>
            )}

            {/* Profile — removed ⌄ symbol */}
            <div className="profile-click" onClick={() => navigate("/user/profile/basic-details")}>
              <div className="user-avatar">{userName[0]?.toUpperCase()}</div>
              <span>{userName}</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Investment</p>
            <h2>{totalInvestment > 0 ? formatCurrency(totalInvestment) : "₹0"}</h2>
          </div>
          <div className="stat-card">
            <p>Current Value</p>
            <h2>{totalInvestment > 0 ? formatCurrency(currentValue) : "₹0"}</h2>
          </div>
          <div className="stat-card">
            <p>Total Gain</p>
            <h2 className="green">{totalInvestment > 0 ? formatCurrency(totalGain) : "₹0"}</h2>
            <h4 className="green">(+{gainPercent}%)</h4>
          </div>
        </div>

        <div className="main-grid">
          <div className="overview-card">
            <div className="section-head">
              <h3>Portfolio Overview</h3>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setShowCustomCalendar(e.target.value === "custom");
                  if (e.target.value !== "custom") setSelectedDate(null);
                }}
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom</option>
              </select>

              {showCustomCalendar && (
                <div className="custom-calendar">
                  <div className="calendar-top">
                    <div className="calendar-title">
                      {monthNames[selectedCalendarMonth]} {selectedYear}
                    </div>
                    <div className="calendar-arrows">
                      <button onClick={() => {
                        if (selectedCalendarMonth === 0) { setSelectedCalendarMonth(11); setSelectedYear(y => y - 1); }
                        else setSelectedCalendarMonth(m => m - 1);
                      }}>‹</button>
                      <button onClick={() => {
                        if (selectedCalendarMonth === 11) { setSelectedCalendarMonth(0); setSelectedYear(y => y + 1); }
                        else setSelectedCalendarMonth(m => m + 1);
                      }}>›</button>
                    </div>
                  </div>
                  <div className="calendar-days">{days.map((d, i) => <span key={i}>{d}</span>)}</div>
                  <div className="calendar-grid">
                    {getCalendarDays().map((day, i) => (
                      <button
                        key={i}
                        className={selectedDate === day ? "selected-date" : ""}
                        disabled={!day}
                        onClick={() => {
                          setSelectedDate(day);
                          setShowCustomCalendar(false); // Close calendar on date select
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {selectedDate && (
                    <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", color: "#6C3AED", fontWeight: 600 }}>
                      Selected: {selectedDate} {monthNames[selectedCalendarMonth]} {selectedYear}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="chart-area">
              <div className="y-labels">
                <span>2L</span><span>1.5L</span><span>1L</span><span>50K</span><span>0K</span>
              </div>
              <div className="chart-scroll">
                <svg viewBox={`0 0 ${chartWidth} 230`} className="line-chart-scroll" style={{ width: `${chartWidth}px` }}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6c3aed" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#6c3aed" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={chartArea} fill="url(#chartFill)" />
                  <polyline points={chartPoints} fill="none" stroke="#5b21d9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {scaledPoints.map((point, i) => (
                    <g key={i}>
                      <circle cx={point.x} cy={point.y} r="5" fill="#5b21d9" stroke="white" strokeWidth="2" />
                      <text x={point.x} y={point.y - 12} textAnchor="middle" className="chart-value-label">{formatChartValue(point.value)}</text>
                      <text x={point.x} y="220" textAnchor="middle" className="chart-date-label">{point.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <div className="allocation-card">
            <h3>Asset Allocation</h3>
            <div className="donut"></div>
            <div className="allocation-list">
              <p><span><i className="dot purple"></i>Equity</span><b>60%</b></p>
              <p><span><i className="dot blue"></i>Debt</span><b>25%</b></p>
              <p><span><i className="dot yellow"></i>Hybrid</span><b>15%</b></p>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="small-card sip-card">
            <div>
              <h3>My SIPs</h3>
              <p>Active SIPs</p>
              <h2>{activeSips.length}</h2>
            </div>
            <div className="icon-circle purple-icon">📅</div>
          </div>

          <div className="small-card sip-card">
            <div>
              <h3>Upcoming SIP</h3>
              {nextSip ? (
                <>
                  <p>{nextSip.fund_name}</p>
                  <span>{new Date(nextSip.start_date).toLocaleDateString("en-IN")}</span>
                  <h2>- {formatCurrency(nextSip.amount)}</h2>
                </>
              ) : (
                <>
                  <p style={{ color: "#9ca3af", fontSize: "13px" }}>No active SIPs</p>
                  <button onClick={() => navigate("/mutual-fund")} style={{ marginTop: "8px", background: "#6C3AED", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
                    Start a SIP
                  </button>
                </>
              )}
            </div>
            <div className="icon-circle green-icon">📅</div>
          </div>

          <div className="small-card transactions-card">
            <div className="transaction-card-header">
              <h3>Recent Transactions</h3>
              <button className="see-all-btn" onClick={() => navigate("/transactions")}>See all →</button>
            </div>
            <div className="transaction-list">
              {transactions.length > 0
                ? transactions.slice(0, 2).map((item, i) => (
                    <div className="transaction-row" key={i}>
                      <div>
                        <b>{item.fund_id}</b>
                        <p>{new Date(item.transaction_date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={item.transaction_type === "BUY" ? "green" : ""}>
                        {item.transaction_type === "BUY" ? "+ " : "- "}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))
                : (
                  <div style={{ textAlign: "center", padding: "16px" }}>
                    <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "8px" }}>No transactions yet</p>
                    <button onClick={() => navigate("/mutual-fund")} style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
                      Start Investing
                    </button>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {showTransactionPanel && (
          <div className="transaction-panel">
            <div className="panel-header">
              <h3>Transaction History</h3>
              <button className="close-panel-btn" onClick={() => setShowTransactionPanel(false)}>✕</button>
            </div>
            <div className="panel-body">
              {transactions.length > 0
                ? transactions.map((item, i) => (
                    <div className="panel-transaction" key={i}>
                      <div>
                        <b>{item.fund_id}</b>
                        <p>{new Date(item.transaction_date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={item.transaction_type === "BUY" ? "green" : ""}>
                        {item.transaction_type === "BUY" ? "+ " : "- "}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))
                : <p style={{color:"#aaa", textAlign:"center", padding:"20px"}}>No transactions yet</p>
              }
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;