import { useState, useEffect } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioTable from "./PortfolioTable";
import "./portfolio.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";
const SIP_SERVICE_URL = import.meta.env.VITE_SIP_API || "http://localhost:4004";

const getAmcLogo = (fundName = "") => {
  const name = fundName.toLowerCase();
  if (name.includes("hdfc")) return "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png";
  if (name.includes("sbi")) return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
  if (name.includes("parag")) return "https://assets-netstorage.groww.in/mf-assets/logos/ppfas_groww.png";
  if (name.includes("nippon")) return "https://assets-netstorage.groww.in/mf-assets/logos/nippon_groww.png";
  if (name.includes("quant")) return "https://assets-netstorage.groww.in/mf-assets/logos/quant_groww.png";
  if (name.includes("axis")) return "https://assets-netstorage.groww.in/mf-assets/logos/axis_groww.png";
  if (name.includes("icici")) return "https://assets-netstorage.groww.in/mf-assets/logos/icici_groww.png";
  if (name.includes("bandhan")) return "https://assets-netstorage.groww.in/mf-assets/logos/bandhan_groww.png";
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

export default function PortfolioPage() {
  const [isMasked, setIsMasked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState([]);
  const [summary, setSummary] = useState({
    currentValue: 0, investedValue: 0,
    dayChangeAmount: 0, dayChangePct: 0,
    returnsAmount: 0, returnsPct: 0, xirr: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ]).then(([txData, sipData]) => {
      const transactions = txData.transactions || [];
      const sips = Array.isArray(sipData) ? sipData : [];

      // Group transactions by fund
      const fundMap = {};
      transactions.forEach(tx => {
        const key = tx.fund_id;
        if (!fundMap[key]) {
          fundMap[key] = { name: key, invested: 0, type: "LUMPSUM", logo: getAmcLogo(key) };
        }
        if (tx.transaction_type === "BUY") fundMap[key].invested += Number(tx.amount || 0);
      });

      // Mark SIP funds
      sips.forEach(sip => {
        if (fundMap[sip.fund_name]) fundMap[sip.fund_name].type = "SIP";
      });

      const fundList = Object.values(fundMap).map(f => {
        const currentValue = f.invested * 1.19;
        const returnsAmount = currentValue - f.invested;
        const returnsPct = f.invested > 0 ? ((returnsAmount / f.invested) * 100).toFixed(2) : 0;
        return {
          code: Math.random(),
          name: f.name,
          type: f.type,
          logo: f.logo,
          xirr: Number(returnsPct),
          dayChangeAmount: -(f.invested * 0.0075),
          dayChangePct: -0.75,
          returnsAmount,
          returnsPct: Number(returnsPct),
          currentValue,
          investedValue: f.invested,
        };
      });

      const totalInvested = fundList.reduce((s, f) => s + f.investedValue, 0);
      const totalCurrent = fundList.reduce((s, f) => s + f.currentValue, 0);
      const totalReturns = totalCurrent - totalInvested;
      const returnsPct = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0;

      setSummary({
        currentValue: totalCurrent,
        investedValue: totalInvested,
        dayChangeAmount: -(totalInvested * 0.0075),
        dayChangePct: -0.75,
        returnsAmount: totalReturns,
        returnsPct: Number(returnsPct),
        xirr: Number(returnsPct),
      });

      setFunds(fundList);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout pageTitle="Portfolio">
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "8px" }}>
        <header className="pf-portfolio-header">
          <h2 className="pf-portfolio-title">
            {loading ? "Investments" : `Investments (${funds.length})`}
          </h2>
          <button type="button" className="pf-eye-toggle-btn" onClick={() => setIsMasked(!isMasked)}
            title={isMasked ? "Show values" : "Hide values"}>
            {isMasked ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading portfolio...</div>
        ) : funds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div>
            <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: "8px" }}>No Investments Yet</h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Start investing in mutual funds to build your portfolio.</p>
          </div>
        ) : (
          <>
            <PortfolioSummary summaryData={summary} isMasked={isMasked} />
            <PortfolioTable investments={funds} isMasked={isMasked} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}