import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function FundChart({
  rawHistory = [],
  themeColor = "#6C3AED",
  timeframe: propTimeframe,
  setTimeframe: propSetTimeframe,
}) {
  const [localTimeframe, localSetTimeframe] = useState("1Y");
  const timeframe = propTimeframe !== undefined ? propTimeframe : localTimeframe;
  const setTimeframe = propSetTimeframe !== undefined ? propSetTimeframe : localSetTimeframe;

  // Filter and process chart data
  const processedData = useMemo(() => {
    if (!rawHistory || rawHistory.length === 0) return [];

    const now = new Date();
    const cutoffDate = new Date();

    if (timeframe === "1M") {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === "6M") {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (timeframe === "1Y") {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else if (timeframe === "3Y") {
      cutoffDate.setFullYear(now.getFullYear() - 3);
    } else if (timeframe === "5Y") {
      cutoffDate.setFullYear(now.getFullYear() - 5);
    }

    const filtered = rawHistory.filter((item) => {
      if (timeframe === "ALL") return true;
      const [day, month, year] = item.date.split("-");
      const itemDate = new Date(year, month - 1, day);
      return itemDate >= cutoffDate;
    });

    // Transform and reverse to show left-to-right chronologically
    return filtered
      .map((item) => ({
        date: item.date,
        nav: parseFloat(item.nav),
      }))
      .reverse();
  }, [rawHistory, timeframe]);

  if (!rawHistory || rawHistory.length === 0) {
    return (
      <div className="mf-detail-card" style={{ padding: "24px", textAlign: "center", color: "var(--mf-text-muted)" }}>
        No historical chart data available.
      </div>
    );
  }

  return (
    <div className="mf-detail-card" style={{ padding: "24px", marginBottom: "24px" }}>
      <div
        className="mf-chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--mf-text-dark)",
          }}
        >
          NAV Historical Performance Chart
        </h3>

        {/* Timeframe selector tabs */}
        <div
          className="mf-chart-tabs"
          style={{
            display: "flex",
            gap: "4px",
            backgroundColor: "#F3F4F6",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          {["1M", "6M", "1Y", "3Y", "5Y", "ALL"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTimeframe(tab)}
              style={{
                backgroundColor: timeframe === tab ? themeColor : "transparent",
                color: timeframe === tab ? "#FFFFFF" : "#4B5563",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
                transition: "all 0.2s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "260px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <XAxis dataKey="date" hide />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--mf-border-color)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                color: "#111827",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#6B7280", marginBottom: "4px" }}
              itemStyle={{ color: themeColor, fontWeight: 600 }}
              formatter={(value) => [`₹${value.toFixed(2)}`, "NAV"]}
            />
            <Line
              type="monotone"
              dataKey="nav"
              stroke={themeColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: themeColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FundChart;
