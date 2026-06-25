export default function PortfolioSummary({ summaryData, isMasked }) {
  const isLossDay = summaryData.dayChangePct < 0;
  const isLossTotal = summaryData.returnsPct < 0;

  return (
    <div className="pf-summary-card">
      {/* Top Section */}
      <div className="pf-summary-top">
        <div>
          <div className="pf-summary-label">Current Value</div>
          <div className="pf-summary-value-large">
            {isMasked ? "•••••" : `₹ ${summaryData.currentValue.toLocaleString("en-IN")}`}
          </div>
        </div>

        {/*
        <button type="button" className="pf-analyse-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analyse
        </button>
        */}

      </div>

      <hr className="pf-divider-dotted" />

      {/* Grid Section */}
      <div className="pf-summary-metrics-grid">
        {/* Invested Value */}
        <div className="pf-metric-col">
          <span className="pf-metric-label">Invested value</span>
          <span className="pf-metric-value">
            {isMasked ? "•••••" : `₹ ${summaryData.investedValue.toLocaleString("en-IN")}`}
          </span>
        </div>

        {/* 1D Returns */}
        <div className="pf-metric-col">
          <span className="pf-metric-label">1D returns</span>
          <span className={`pf-metric-value ${isLossDay ? "negative" : "positive"}`}>
            {isMasked ? "•••••" : `₹ ${summaryData.dayChangeAmount.toLocaleString("en-IN")}`}
            <span style={{ fontSize: "14px", fontWeight: "600", marginLeft: "4px" }}>
              ({isLossDay ? "" : "+"}{summaryData.dayChangePct}%)
            </span>
          </span>
        </div>

        {/* Total Returns */}
        <div className="pf-metric-col">
          <span className="pf-metric-label">Total returns</span>
          <span className={`pf-metric-value ${isLossTotal ? "negative" : "positive"}`}>
            {isMasked ? "•••••" : `₹ ${summaryData.returnsAmount.toLocaleString("en-IN")}`}
            <span style={{ fontSize: "14px", fontWeight: "600", marginLeft: "4px" }}>
              ({isLossTotal ? "" : "+"}{summaryData.returnsPct}%)
            </span>
          </span>
        </div>

        {/* XIRR */}
        <div className="pf-metric-col">
          <span className="pf-metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            XIRR
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
          <span className="pf-metric-value">
            {summaryData.xirr}%
          </span>
        </div>
      </div>
    </div>
  );
}
