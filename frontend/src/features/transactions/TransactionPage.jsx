import { useState } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./transactions.css";

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "investments" | "redemptions" | "sip"

  // Raw transactions list containing buy/sell and sip/lumpsum details
  const transactions = [
    {
      id: "TX-1005",
      date: "17 Jun '26",
      schemeName: "HDFC Silver ETF FoF Direct Growth",
      amount: 100,
      orderType: "BUY", // BUY | SELL
      buyType: "SIP", // SIP | LUMPSUM
      status: "Completed" // Completed | Failed
    },
    {
      id: "TX-1004",
      date: "17 May '26",
      schemeName: "HDFC Silver ETF FoF Direct Growth",
      amount: 100,
      orderType: "BUY",
      buyType: "SIP",
      status: "Failed"
    },
    {
      id: "TX-1003",
      date: "17 Apr '26",
      schemeName: "HDFC Silver ETF FoF Direct Growth",
      amount: 100,
      orderType: "BUY",
      buyType: "SIP",
      status: "Completed"
    },
    {
      id: "TX-1002",
      date: "17 Mar '26",
      schemeName: "HDFC Silver ETF FoF Direct Growth",
      amount: 100,
      orderType: "BUY",
      buyType: "SIP",
      status: "Completed"
    },
    {
      id: "TX-1001",
      date: "27 Feb '26",
      schemeName: "HDFC Silver ETF FoF Direct Growth",
      amount: 550,
      orderType: "BUY",
      buyType: "LUMPSUM",
      status: "Completed"
    },
    {
      id: "TX-0999",
      date: "12 Jan '26",
      schemeName: "SBI Bluechip Fund Direct Growth",
      amount: 10000,
      orderType: "SELL", // Redemption
      buyType: null,
      status: "Completed"
    },
    {
      id: "TX-0998",
      date: "05 Jan '26",
      schemeName: "ICICI Prudential Bluechip Fund Direct Growth",
      amount: 5000,
      orderType: "BUY",
      buyType: "SIP",
      status: "Completed"
    }
  ];

  // Filtering based on tab selection
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "investments") return tx.orderType === "BUY";
    if (activeTab === "redemptions") return tx.orderType === "SELL";
    if (activeTab === "sip") return tx.orderType === "BUY" && tx.buyType === "SIP";
    return true;
  });

  // Group filtered transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

  return (
    <DashboardLayout pageTitle="Transactions">
      <div className="tx-container">
        <header className="tx-header">
          <h2 className="tx-title">Transaction History</h2>
          <p className="tx-subtitle">View and monitor your order status, SIP installments, and redemptions.</p>
        </header>

        {/* Tab Filters */}
        <div className="tx-tabs-container">
          <button 
            type="button" 
            className={`tx-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button 
            type="button" 
            className={`tx-tab-btn ${activeTab === "investments" ? "active" : ""}`}
            onClick={() => setActiveTab("investments")}
          >
            Investments
          </button>
          <button 
            type="button" 
            className={`tx-tab-btn ${activeTab === "redemptions" ? "active" : ""}`}
            onClick={() => setActiveTab("redemptions")}
          >
            Redemptions
          </button>
          <button 
            type="button" 
            className={`tx-tab-btn ${activeTab === "sip" ? "active" : ""}`}
            onClick={() => setActiveTab("sip")}
          >
            SIPs
          </button>
        </div>

        {/* Transactions List Grouped by Date */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="mf-empty-state" style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--mf-border-color)", borderRadius: "14px", padding: "60px 20px" }}>
            <div style={{ fontSize: "50px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--mf-text-dark)", margin: "0 0 8px 0" }}>No Transactions Found</h3>
            <p style={{ color: "var(--mf-text-muted)", fontSize: "14px", margin: 0 }}>
              There are no transactions in this category matching your filters.
            </p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((date) => (
            <div key={date} className="tx-date-group">
              <div className="tx-date-header">{date}</div>
              
              {groupedTransactions[date].map((tx) => {
                const isBuy = tx.orderType === "BUY";
                const isSip = tx.buyType === "SIP";
                
                return (
                  <div key={tx.id} className="tx-card">
                    {/* Left Details */}
                    <div className="tx-left-section">
                      <div className={`tx-icon-box ${!isBuy ? "sell" : isSip ? "buy-sip" : "buy-lumpsum"}`}>
                        {!isBuy ? "↓" : isSip ? "↻" : "↑"}
                      </div>
                      <div className="tx-info">
                        <span className="tx-fund-name">{tx.schemeName}</span>
                        <div className="tx-meta-row">
                          <span className={`tx-type-badge ${isBuy ? "buy" : "sell"}`}>
                            {isBuy ? "Buy" : "Sell"}
                          </span>
                          <span className="tx-subtype-text">
                            {isBuy ? (isSip ? "SIP Installment" : "One-time") : "Redemption"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Details */}
                    <div className="tx-right-section">
                      <div className="tx-amount-col">
                        <span className={`tx-amount ${isBuy ? "buy" : "sell"}`}>
                          {isBuy ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                        </span>
                        <span className={`tx-status-badge ${tx.status.toLowerCase()}`}>
                          <span className={`tx-dot ${tx.status.toLowerCase()}`} />
                          {tx.status}
                        </span>
                      </div>
                      <div className="tx-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
