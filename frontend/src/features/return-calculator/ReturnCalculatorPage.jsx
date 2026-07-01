import { useState, useMemo } from "react";
import PublicLayout from "../mutual-fund/component/PublicLayout";
import "./return-calculator.css";

// Format number to Indian currency format (₹1,23,456)
const formatCurrency = (num) => {
  if (num === undefined || num === null || isNaN(num)) return "₹0";
  const rounded = Math.round(num);
  const str = rounded.toString();
  // Indian grouping: last 3 digits, then groups of 2
  if (str.length <= 3) return `₹${str}`;
  let lastThree = str.substring(str.length - 3);
  let otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹${formatted}`;
};

function CalculatorSection({ type }) {
  const isSIP = type === "sip";

  // Default values
  const [amount, setAmount] = useState(isSIP ? 100 : 500);
  const [years, setYears] = useState(1);
  const [rate, setRate] = useState(1);

  // Track raw text input for editable fields
  const [amountInput, setAmountInput] = useState(String(isSIP ? 100 : 500));
  const [yearsInput, setYearsInput] = useState("1");
  const [rateInput, setRateInput] = useState("1");

  // Slider ranges
  const amountMin = isSIP ? 100 : 500;
  const amountMax = isSIP ? 100000 : 10000000;
  const amountStep = isSIP ? 500 : 10000;

  // Validated setters — clamp to allowed range
  const handleAmountChange = (val) => {
    const num = Number(val);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(Math.round(num), amountMin), amountMax);
    setAmount(clamped);
    setAmountInput(String(clamped));
  };

  const handleYearsChange = (val) => {
    const num = Number(val);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(Math.round(num), 1), 30);
    setYears(clamped);
    setYearsInput(String(clamped));
  };

  const handleRateChange = (val) => {
    const num = Number(val);
    if (isNaN(num)) return;
    // Round to 1 decimal place, clamp 1–30
    const clamped = Math.min(Math.max(Math.round(num * 10) / 10, 1), 30);
    setRate(clamped);
    setRateInput(String(clamped));
  };

  // Calculate results
  const results = useMemo(() => {
    if (isSIP) {
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;
      const totalInvested = amount * months;
      let totalValue;
      if (monthlyRate === 0) {
        totalValue = totalInvested;
      } else {
        totalValue = amount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      }
      const estimatedReturn = totalValue - totalInvested;
      return { totalInvested, estimatedReturn, totalValue };
    } else {
      const totalInvested = amount;
      const totalValue = amount * Math.pow(1 + rate / 100, years);
      const estimatedReturn = totalValue - totalInvested;
      return { totalInvested, estimatedReturn, totalValue };
    }
  }, [amount, years, rate, isSIP]);

  const investedPct = results.totalValue > 0 ? (results.totalInvested / results.totalValue) * 100 : 50;
  const returnPct = 100 - investedPct;

  // Compute slider fill for track coloring
  const amountFill = ((amount - amountMin) / (amountMax - amountMin)) * 100;
  const yearsFill = ((years - 1) / (30 - 1)) * 100;
  const rateFill = ((rate - 1) / (30 - 1)) * 100;

  const sliderTrackStyle = (fill) => ({
    background: `linear-gradient(to right, #6C3AED 0%, #8B5CF6 ${fill}%, #e5e7eb ${fill}%)`,
  });

  return (
    <div className="rc-calculator-card">
      <div className="rc-card-inner">
        {/* Left — Inputs */}
        <div className="rc-inputs-section">
          {/* Amount Input + Slider */}
          <div className="rc-input-group">
            <div className="rc-input-label-row">
              <span className="rc-input-label">
                {isSIP ? "Monthly Investment" : "Total Investment"}
              </span>
              <div className="rc-input-field-wrap">
                <span className="rc-input-prefix">₹</span>
                <input
                  type="number"
                  className="rc-input-field"
                  min={amountMin}
                  max={amountMax}
                  step={amountStep}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  onBlur={() => handleAmountChange(amountInput)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAmountChange(amountInput); }}
                  id={`rc-${type}-amount-input`}
                />
              </div>
            </div>
            <input
              type="range"
              className="rc-slider"
              min={amountMin}
              max={amountMax}
              step={amountStep}
              value={amount}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAmount(v);
                setAmountInput(String(v));
              }}
              style={sliderTrackStyle(amountFill)}
              id={`rc-${type}-amount`}
            />
            <div className="rc-slider-range">
              <span>{formatCurrency(amountMin)}</span>
              <span>{formatCurrency(amountMax)}</span>
            </div>
          </div>

          {/* Years Input + Slider */}
          <div className="rc-input-group">
            <div className="rc-input-label-row">
              <span className="rc-input-label">Time Period</span>
              <div className="rc-input-field-wrap">
                <input
                  type="number"
                  className="rc-input-field"
                  min={1}
                  max={30}
                  step={1}
                  value={yearsInput}
                  onChange={(e) => setYearsInput(e.target.value)}
                  onBlur={() => handleYearsChange(yearsInput)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleYearsChange(yearsInput); }}
                  id={`rc-${type}-years-input`}
                />
                <span className="rc-input-suffix">Yrs</span>
              </div>
            </div>
            <input
              type="range"
              className="rc-slider"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => {
                const v = Number(e.target.value);
                setYears(v);
                setYearsInput(String(v));
              }}
              style={sliderTrackStyle(yearsFill)}
              id={`rc-${type}-years`}
            />
            <div className="rc-slider-range">
              <span>1 Yr</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Interest Rate Input + Slider */}
          <div className="rc-input-group">
            <div className="rc-input-label-row">
              <span className="rc-input-label">Expected Return Rate (p.a.)</span>
              <div className="rc-input-field-wrap">
                <input
                  type="number"
                  className="rc-input-field"
                  min={1}
                  max={30}
                  step={0.1}
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  onBlur={() => handleRateChange(rateInput)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRateChange(rateInput); }}
                  id={`rc-${type}-rate-input`}
                />
                <span className="rc-input-suffix">%</span>
              </div>
            </div>
            <input
              type="range"
              className="rc-slider"
              min={1}
              max={30}
              step={0.1}
              value={rate}
              onChange={(e) => {
                const v = Number(e.target.value);
                setRate(v);
                setRateInput(String(v));
              }}
              style={sliderTrackStyle(rateFill)}
              id={`rc-${type}-rate`}
            />
            <div className="rc-slider-range">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        {/* Right — Results */}
        <div className="rc-results-section">
          <div className="rc-results-title">
            {isSIP ? "SIP" : "Lumpsum"} Returns
          </div>

          <div className="rc-result-items">
            <div className="rc-result-item">
              <span className="rc-result-item-label">
                <span className="rc-result-item-dot invested"></span>
                Invested Amount
              </span>
              <span className="rc-result-item-value">
                {formatCurrency(results.totalInvested)}
              </span>
            </div>
            <div className="rc-result-item">
              <span className="rc-result-item-label">
                <span className="rc-result-item-dot returns"></span>
                Est. Returns
              </span>
              <span className="rc-result-item-value">
                {formatCurrency(results.estimatedReturn)}
              </span>
            </div>
            <div className="rc-result-item" style={{ border: "2px solid #6C3AED" }}>
              <span className="rc-result-item-label">
                <span className="rc-result-item-dot total"></span>
                Total Value
              </span>
              <span className="rc-result-item-value total-val">
                {formatCurrency(results.totalValue)}
              </span>
            </div>
          </div>

          {/* Breakdown Rectangle Bar */}
          <div className="rc-breakdown-bar-wrapper">
            <span className="rc-breakdown-label">Investment Breakdown</span>
            <div className="rc-breakdown-bar">
              <div
                className="rc-bar-invested"
                style={{ width: `${Math.max(investedPct, 5)}%` }}
              >
                <span className="rc-bar-text">{investedPct.toFixed(0)}%</span>
              </div>
              <div
                className="rc-bar-returns"
                style={{ width: `${Math.max(returnPct, 5)}%` }}
              >
                <span className="rc-bar-text">{returnPct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="rc-breakdown-legend">
              <span className="rc-legend-item">
                <span className="rc-legend-dot invested"></span>
                Invested
              </span>
              <span className="rc-legend-item">
                <span className="rc-legend-dot returns"></span>
                Returns
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rc-info-note">
        <span>⚠️ Disclaimer: Mutual fund investments are subject to market risks. The calculator provides estimates based on assumed rate of return and does not guarantee actual returns.</span>
      </div>
    </div>
  );
}

export default function ReturnCalculatorPage() {
  const [activeTab, setActiveTab] = useState("sip");

  return (
    <PublicLayout pageTitle="Return Calculator">
      <div className="rc-page">
        {/* Hero with Tabs */}
        <div className="rc-hero">
          <h1 className="rc-hero-title">Mutual Fund Return Calculator</h1>
          <p className="rc-hero-subtitle">
            Plan your investments — estimate SIP &amp; Lumpsum returns instantly
          </p>
          <div className="rc-tabs">
            <button
              className={`rc-tab ${activeTab === "sip" ? "active" : ""}`}
              onClick={() => setActiveTab("sip")}
              id="rc-tab-sip"
            >
              SIP
            </button>
            <button
              className={`rc-tab ${activeTab === "lumpsum" ? "active" : ""}`}
              onClick={() => setActiveTab("lumpsum")}
              id="rc-tab-lumpsum"
            >
              Lumpsum
            </button>
          </div>
        </div>

        {/* Calculator */}
        <div className="rc-container">
          {activeTab === "sip" ? (
            <CalculatorSection key="sip" type="sip" />
          ) : (
            <CalculatorSection key="lumpsum" type="lumpsum" />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
