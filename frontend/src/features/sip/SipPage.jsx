import { useState } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./sip.css";

export default function SipPage() {
  // 5 active SIPs with different dates and schemes
  const [sips, setSips] = useState([
    {
      id: "SIP-101",
      name: "HDFC Silver ETF FoF Direct Growth",
      amount: 100,
      dueDate: "19",
      dueMonth: "Jul",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png"
    },
    {
      id: "SIP-102",
      name: "SBI Bluechip Fund Direct Growth",
      amount: 500,
      dueDate: "05",
      dueMonth: "Jul",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png"
    },
    {
      id: "SIP-103",
      name: "Parag Parikh Flexi Cap Fund Direct Growth",
      amount: 1000,
      dueDate: "12",
      dueMonth: "Aug",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/ppfas_groww.png"
    },
    {
      id: "SIP-104",
      name: "Nippon India Small Cap Fund Direct Growth",
      amount: 500,
      dueDate: "25",
      dueMonth: "Jul",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/nippon_groww.png"
    },
    {
      id: "SIP-105",
      name: "Quant Active Fund Direct Growth",
      amount: 400,
      dueDate: "08",
      dueMonth: "Aug",
      logo: "https://assets-netstorage.groww.in/mf-assets/logos/quant_groww.png"
    }
  ]);

  // Calculate total monthly SIP amount logic dynamically
  const totalSipAmount = sips.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout pageTitle="SIP">
      <div className="sip-container">
        {/* Monthly SIP Amount Summary Card */}
        <div className="sip-summary-card">
          <div className="sip-summary-label">Monthly SIP amount</div>
          <div className="sip-summary-value">₹{totalSipAmount.toLocaleString("en-IN")}</div>
        </div>

        {/* Active SIP List Header */}
        <div className="sip-list-header">
          <h3 className="sip-list-title">Active SIP ({sips.length})</h3>
          <div className="sip-sort-wrapper">
            <span>Sort by: Due Date</span>
          </div>
        </div>

        {/* SIP List Cards (No Autopay Card included) */}
        <div className="sip-cards-list">
          {sips.map((item) => (
            <div key={item.id} className="sip-card">
              <div className="sip-left">
                <img src={item.logo} alt={item.name} className="sip-logo" />
                <div className="sip-info">
                  <span className="sip-name">{item.name}</span>
                  <span className="sip-amount">₹{item.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="sip-right">
                <div className="sip-date-box" title="Next installment date">
                  <span className="sip-date-day">{item.dueDate}</span>
                  <span className="sip-date-month">{item.dueMonth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
