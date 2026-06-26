import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import "./dashboard.css";

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransactionPanel, setShowTransactionPanel] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("thisMonth");
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
const [selectedYear, setSelectedYear] = useState(2026);
const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(0);
const [selectedDate, setSelectedDate] = useState(null);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = ["S", "M", "T", "W", "T", "F", "S"];

const getCalendarDays = () => {
  const firstDay = new Date(selectedYear, selectedCalendarMonth, 1).getDay();
  const totalDays = new Date(selectedYear, selectedCalendarMonth + 1, 0).getDate();

  const blankDays = Array(firstDay).fill(null);
  const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  return [...blankDays, ...monthDays];
};

  const chartData = {
    thisMonth: [
      { label: "May 01", value: 25000 },
      { label: "May 03", value: 42000 },
      { label: "May 05", value: 60000 },
      { label: "May 07", value: 85000 },
      { label: "May 09", value: 110000 },
      { label: "May 11", value: 98000 },
      { label: "May 13", value: 125000 },
      { label: "May 15", value: 118000 },
      { label: "May 17", value: 145000 },
      { label: "May 19", value: 138000 },
      { label: "May 21", value: 160000 },
      { label: "May 23", value: 168000 },
      { label: "May 25", value: 182000 },
      { label: "May 27", value: 174000 },
      { label: "May 29", value: 195000 },
      { label: "May 31", value: 210000 },
    ],
    lastMonth: [
      { label: "Apr 01", value: 18000 },
      { label: "Apr 03", value: 35000 },
      { label: "Apr 05", value: 29000 },
      { label: "Apr 07", value: 52000 },
      { label: "Apr 09", value: 68000 },
      { label: "Apr 11", value: 63000 },
      { label: "Apr 13", value: 82000 },
      { label: "Apr 15", value: 96000 },
      { label: "Apr 17", value: 88000 },
      { label: "Apr 19", value: 105000 },
      { label: "Apr 21", value: 99000 },
      { label: "Apr 23", value: 120000 },
      { label: "Apr 25", value: 132000 },
      { label: "Apr 27", value: 126000 },
      { label: "Apr 29", value: 150000 },
      { label: "Apr 30", value: 158000 },
    ],
  };

  const transactionData = [
    { fund: "Axis Bluechip Fund", date: "23 May 2025", amount: "+ ₹5,000" },
    { fund: "ICICI Prudential Bluechip Fund", date: "20 May 2025", amount: "- ₹10,000" },
    { fund: "SBI Small Cap Fund", date: "18 May 2025", amount: "+ ₹3,000" },
    { fund: "HDFC Balanced Advantage Fund", date: "15 May 2025", amount: "- ₹2,500" },
    { fund: "Mirae Asset Large Cap", date: "12 May 2025", amount: "+ ₹8,000" },
    { fund: "Quant Flexi Cap", date: "08 May 2025", amount: "+ ₹6,500" },
    { fund: "Parag Parikh Flexi Cap", date: "05 May 2025", amount: "- ₹4,000" },
  ];

  const hour = new Date().getHours();
  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17) {
    greeting = "Good Evening";
  }

  const handleSeeAll = () => {
    setShowTransactionPanel(true);
  };

  const handleProfile = () => {
    alert("Profile page coming soon");
  };

  const currentChart =
  selectedMonth === "custom" ? chartData.thisMonth : chartData[selectedMonth];
  const chartWidth = currentChart.length * 90;
  const maxValue = 220000;
  const minY = 28;
  const maxY = 175;

  const scaledPoints = currentChart.map((item, index) => {
    const x = index * 90 + 45;
    const y = maxY - (item.value / maxValue) * (maxY - minY);

    return {
      ...item,
      x,
      y,
    };
  });

  const chartPoints = scaledPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const firstPoint = scaledPoints[0];
  const lastPoint = scaledPoints[scaledPoints.length - 1];
  const chartArea = `${chartPoints} ${lastPoint.x},190 ${firstPoint.x},190`;

  const formatChartValue = (value) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    }

    return `${Math.round(value / 1000)}K`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>{greeting}, Ankita! 👋</h1>
            <p>Here's what's happening with your investments today.</p>
          </div>

          <div className="user-box">
            <button
              className="bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                <p>✅ SIP payment reminder for 05 Jun 2025</p>
                <p>📈 Axis Bluechip Fund gained +₹5,000</p>
                <p>🔐 KYC verification pending</p>
              </div>
            )}

            <div className="profile-click" onClick={handleProfile}>
              <div className="user-avatar">A</div>
              <span>Ankita⌄</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Investment</p>
            <h2>₹1,25,000</h2>
          </div>

          <div className="stat-card">
            <p>Current Value</p>
            <h2>₹1,48,750</h2>
          </div>

          <div className="stat-card">
            <p>Total Gain</p>
            <h2 className="green">₹23,750</h2>
            <h4 className="green">(+19.00%)</h4>
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
        <span>⌄</span>
      </div>

      <div className="calendar-arrows">
        <button
          onClick={() => {
            if (selectedCalendarMonth === 0 && selectedYear > 2026) {
              setSelectedCalendarMonth(11);
              setSelectedYear(selectedYear - 1);
            } else if (selectedCalendarMonth > 0) {
              setSelectedCalendarMonth(selectedCalendarMonth - 1);
            }
          }}
        >
          ‹
        </button>

        <button
          onClick={() => {
            if (selectedCalendarMonth === 11 && selectedYear < 2050) {
              setSelectedCalendarMonth(0);
              setSelectedYear(selectedYear + 1);
            } else if (selectedCalendarMonth < 11) {
              setSelectedCalendarMonth(selectedCalendarMonth + 1);
            }
          }}
        >
          ›
        </button>
      </div>
    </div>

    <div className="calendar-days">
      {days.map((day, index) => (
        <span key={index}>{day}</span>
      ))}
    </div>

    <div className="calendar-grid">
      {getCalendarDays().map((day, index) => (
        <button
          key={index}
          className={selectedDate === day ? "selected-date" : ""}
          disabled={!day}
          onClick={() => setSelectedDate(day)}
        >
          {day}
        </button>
      ))}
    </div>
  </div>
)}
            </div>

            <div className="chart-area">
              <div className="y-labels">
                <span>2L</span>
                <span>1.5L</span>
                <span>1L</span>
                <span>50K</span>
                <span>0K</span>
              </div>

              <div className="chart-scroll">
                <svg
                  viewBox={`0 0 ${chartWidth} 230`}
                  className="line-chart-scroll"
                  style={{ width: `${chartWidth}px` }}
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6c3aed" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#6c3aed" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <polygon points={chartArea} fill="url(#chartFill)" />

                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="#5b21d9"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {scaledPoints.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#5b21d9"
                        stroke="white"
                        strokeWidth="2"
                      />

                      <text
                        x={point.x}
                        y={point.y - 12}
                        textAnchor="middle"
                        className="chart-value-label"
                      >
                        {formatChartValue(point.value)}
                      </text>

                      <text
                        x={point.x}
                        y="220"
                        textAnchor="middle"
                        className="chart-date-label"
                      >
                        {point.label}
                      </text>
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
              <p>
                <span>
                  <i className="dot purple"></i>Equity
                </span>
                <b>60%</b>
              </p>

              <p>
                <span>
                  <i className="dot blue"></i>Debt
                </span>
                <b>25%</b>
              </p>

              <p>
                <span>
                  <i className="dot yellow"></i>Hybrid
                </span>
                <b>15%</b>
              </p>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="small-card sip-card">
            <div>
              <h3>My SIPs</h3>
              <p>Active SIPs</p>
              <h2>3</h2>
            </div>

            <div className="icon-circle purple-icon">📅</div>
          </div>

          <div className="small-card sip-card">
            <div>
              <h3>Upcoming SIP</h3>
              <p>Quantitative Fund</p>
              <span>05 Jun 2025</span>
              <h2>- ₹5,000</h2>
            </div>

            <div className="icon-circle green-icon">📅</div>
          </div>

          <div className="small-card transactions-card">
            <div className="transaction-card-header">
              <h3>Recent Transactions</h3>

              <button className="see-all-btn" onClick={handleSeeAll}>
                See all →
              </button>
            </div>

            <div className="transaction-list">
              {transactionData.slice(0, 2).map((item, index) => (
                <div className="transaction-row" key={index}>
                  <div>
                    <b>{item.fund}</b>
                    <p>{item.date}</p>
                  </div>

                  <span className={item.amount.includes("+") ? "green" : ""}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showTransactionPanel && (
          <div className="transaction-panel">
            <div className="panel-header">
              <h3>Transaction History</h3>

              <button
                className="close-panel-btn"
                onClick={() => setShowTransactionPanel(false)}
              >
                ✕
              </button>
            </div>

            <div className="panel-body">
              {transactionData.map((item, index) => (
                <div className="panel-transaction" key={index}>
                  <div>
                    <b>{item.fund}</b>
                    <p>{item.date}</p>
                  </div>

                  <span className={item.amount.includes("+") ? "green" : ""}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;