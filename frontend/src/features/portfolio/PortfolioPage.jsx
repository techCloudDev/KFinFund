import { useState } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioTable from "./PortfolioTable";
import "./portfolio.css";

export default function PortfolioPage() {
  const [isMasked, setIsMasked] = useState(true);

  // Portfolio data matching the screenshot exactly
  const summary = {
    currentValue: 106275,
    investedValue: 125000,
    dayChangeAmount: -800,
    dayChangePct: -0.75,
    returnsAmount: -18725,
    returnsPct: -14.98,
    xirr: 1.77
  };

  const funds = [
    {
      code: 102868,
      name: "HDFC Silver ETF FoF Direct Growth",
      type: "SIP",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png",
      xirr: -45.88,
      dayChangeAmount: -800,
      dayChangePct: -0.75,
      returnsAmount: -18725,
      returnsPct: -14.98,
      currentValue: 106275,
      investedValue: 125000
    }
  ];

  return (
    <DashboardLayout pageTitle="Portfolio">
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "8px" }}>
        {/* Header with Title and Toggle */}
        <header className="pf-portfolio-header">
          <h2 className="pf-portfolio-title">Investments ({funds.length})</h2>
          
          <button
            type="button"
            className="pf-eye-toggle-btn"
            onClick={() => setIsMasked(!isMasked)}
            title={isMasked ? "Show values" : "Hide values"}
          >
            {isMasked ? (
              /* Closed Eye Icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Open Eye Icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </header>

        {/* Layer 2: Portfolio Summary */}
        <PortfolioSummary summaryData={summary} isMasked={isMasked} />

        {/* Layer 3: Portfolio Table */}
        <PortfolioTable investments={funds} isMasked={isMasked} />
      </div>
    </DashboardLayout>
  );
}
