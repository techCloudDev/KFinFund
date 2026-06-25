import { useNavigate } from "react-router-dom";

export default function PortfolioRow({ fund, isMasked }) {
  const navigate = useNavigate();
  const isLossDay = fund.dayChangePct < 0;
  const isLossTotal = fund.returnsPct < 0;

  return (
    <tr>
      {/* Column 1: Fund Logo, Name & Type */}
      <td>
        <div 
          className="mf-table-logo-box" 
          onClick={() => navigate(`/mutual-fund/${fund.code}`)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
        >
          <img 
            src={fund.logo || "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png"} 
            alt={fund.name} 
            className="mf-table-logo" 
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "contain", border: "1px solid var(--mf-border-color)" }}
          />
          <div className="pf-fund-info">
            <span className="pf-fund-name" style={{ fontWeight: "700", color: "var(--mf-text-dark)" }}>{fund.name}</span>
            <span className="pf-fund-type" style={{ fontSize: "12px", color: "var(--mf-text-muted)" }}>{fund.type}</span>
          </div>
        </div>
      </td>

      {/* Column 2: XIRR */}
      <td style={{ fontWeight: "700" }}>
        {fund.xirr}%
      </td>

      {/* Column 3: Day Change */}
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            {isMasked ? "....." : `₹ ${fund.dayChangeAmount.toLocaleString("en-IN")}`}
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: isLossDay ? "#EF4444" : "#10B981" }}>
            {isLossDay ? "" : "+"}{fund.dayChangePct}%
          </span>
        </div>
      </td>

      {/* Column 4: Returns */}
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            {isMasked ? "....." : `₹ ${fund.returnsAmount.toLocaleString("en-IN")}`}
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: isLossTotal ? "#EF4444" : "#10B981" }}>
            {isLossTotal ? "" : "+"}{fund.returnsPct}%
          </span>
        </div>
      </td>

      {/* Column 5: Current (Invested) */}
      <td>
        <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span className="pf-c-val">
              {isMasked ? "....." : `₹ ${fund.currentValue.toLocaleString("en-IN")}`}
            </span>
            <span className="pf-i-val">
              {isMasked ? "..." : `₹ ${fund.investedValue.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}
