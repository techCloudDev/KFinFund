import ProfileLayout from "./ProfileLayout";

export default function ReportPage() {
  // Dummy Profit & Loss data
  const summary = {
    totalInvested: "₹ 1,25,000",
    currentValue: "₹ 1,48,750",
    totalGain: "₹ 23,750 (+19.00%)"
  };

  const plItems = [
    {
      schemeName: "SBI Bluechip Fund Direct Growth",
      invested: "₹ 45,000",
      current: "₹ 52,500",
      gain: "+₹ 7,500",
      returnPct: "+16.67%",
      isPositive: true
    },
    {
      schemeName: "HDFC Mid-Cap Opportunities Fund Direct Growth",
      invested: "₹ 30,000",
      current: "₹ 36,450",
      gain: "+₹ 6,450",
      returnPct: "+21.50%",
      isPositive: true
    },
    {
      schemeName: "Parag Parikh Flexi Cap Fund Direct Growth",
      invested: "₹ 25,000",
      current: "₹ 31,800",
      gain: "+₹ 6,800",
      returnPct: "+27.20%",
      isPositive: true
    },
    {
      schemeName: "Axis Bluechip Fund Direct Plan Growth",
      invested: "₹ 15,000",
      current: "₹ 14,250",
      gain: "-₹ 750",
      returnPct: "-5.00%",
      isPositive: false
    },
    {
      schemeName: "Nippon India Small Cap Fund Direct Growth",
      invested: "₹ 10,000",
      current: "₹ 13,750",
      gain: "+₹ 3,750",
      returnPct: "+37.50%",
      isPositive: true
    }
  ];

  return (
    <ProfileLayout pageTitle="Profit & Loss Report">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Profit & Loss Statement</h2>
        <p className="mf-detail-card-subtitle">Realized and unrealized returns across your mutual fund investments.</p>

        {/* Summary metrics */}
        <div className="mf-pl-summary-cards">
          <div className="mf-pl-card">
            <span className="mf-pl-card-label">Total Invested</span>
            <span className="mf-pl-card-value">{summary.totalInvested}</span>
          </div>
          <div className="mf-pl-card">
            <span className="mf-pl-card-label">Current Value</span>
            <span className="mf-pl-card-value">{summary.currentValue}</span>
          </div>
          <div className="mf-pl-card">
            <span className="mf-pl-card-label">Total P&L</span>
            <span className="mf-pl-card-value positive">{summary.totalGain}</span>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="mf-pl-table-wrapper">
          <table className="mf-pl-table">
            <thead>
              <tr>
                <th>Mutual Fund Scheme</th>
                <th>Invested Value</th>
                <th>Current Value</th>
                <th>Profit / Loss</th>
                <th>Abs. Return</th>
              </tr>
            </thead>
            <tbody>
              {plItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "500", color: "#111827" }}>{item.schemeName}</td>
                  <td>{item.invested}</td>
                  <td>{item.current}</td>
                  <td className={item.isPositive ? "positive" : "negative"} style={{ fontWeight: "600" }}>
                    {item.gain}
                  </td>
                  <td className={item.isPositive ? "positive" : "negative"} style={{ fontWeight: "600" }}>
                    {item.returnPct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProfileLayout>
  );
}
