import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../component/DashboardLayout";
import "../mutual-fund.css";
import { AMC_LOGOS } from "../component/amc_logo";

// AMC logo mappings from Groww CDN

const getAmcLogo = (name = "") => {
  const normalized = name.toLowerCase();
  for (const key in AMC_LOGOS) {
    if (normalized.includes(key)) {
      return AMC_LOGOS[key];
    }
  }
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png"; // Fallback default
};

const getRiskCategory = (schemeName = "") => {
  const name = schemeName.toLowerCase();
  if (
    name.includes("liquid") ||
    name.includes("arbitrage") ||
    name.includes("overnight") ||
    name.includes("debt") ||
    name.includes("treasury")
  ) {
    return "Low";
  } else if (
    name.includes("hybrid") ||
    name.includes("balanced") ||
    name.includes("conservative") ||
    name.includes("allocator")
  ) {
    return "Mid";
  } else {
    return "High";
  }
};

// 30 popular Indian Mutual Fund scheme codes
const POPULAR_30_SCHEMES = [
  { code: 119775, name: "SBI Bluechip Fund Direct Growth" },
  { code: 119063, name: "HDFC Mid-Cap Opportunities Fund Direct Growth" },
  { code: 122639, name: "Parag Parikh Flexi Cap Fund Direct Growth" },
  { code: 120465, name: "Axis Bluechip Fund Direct Plan Growth" },
  { code: 118833, name: "Mirae Asset Large Cap Fund Direct Growth" },
  { code: 120594, name: "ICICI Prudential Bluechip Fund Direct Growth" },
  { code: 120828, name: "Nippon India Small Cap Fund Direct Growth" },
  { code: 120847, name: "Quant Active Fund Direct Growth" },
  { code: 120155, name: "Kotak Emerging Equity Fund Direct Growth" },
  { code: 119280, name: "DSP Midcap Fund Direct Growth" },
  { code: 119062, name: "HDFC Small Cap Fund Direct Growth" },
  { code: 125497, name: "SBI Small Cap Fund Direct Growth" },
  { code: 125354, name: "Axis Small Cap Fund Direct Growth" },
  { code: 120614, name: "ICICI Prudential Value Discovery Fund Direct Growth" },
  { code: 135799, name: "Tata Digital India Fund Direct Growth" },
  { code: 119782, name: "SBI Contra Fund Direct Growth" },
  { code: 118742, name: "Bandhan Sterling Value Fund Direct Growth" },
  { code: 120716, name: "Nippon India Growth Fund Direct Growth" },
  { code: 120849, name: "Quant Small Cap Fund Direct Growth" },
  { code: 118825, name: "Mirae Asset Emerging Bluechip Fund Direct Growth" },
  { code: 119065, name: "HDFC Top 100 Fund Direct Growth" },
  { code: 120473, name: "Axis Midcap Fund Direct Growth" },
  { code: 120147, name: "Kotak Bluechip Fund Direct Growth" },
  { code: 120750, name: "UTI Flexi Cap Fund Direct Growth" },
  { code: 119295, name: "DSP Small Cap Fund Direct Growth" },
  { code: 119551, name: "Aditya Birla Sun Life Frontline Equity Fund Direct Growth" },
  { code: 120599, name: "ICICI Prudential Asset Allocator Fund Direct Growth" },
  { code: 148784, name: "Bandhan Small Cap Fund Direct Growth" },
  { code: 119827, name: "Nippon India Liquid Fund Direct Growth" },
  { code: 119854, name: "Axis Liquid Fund Direct Growth" },
];

// Curated landing page cards with AMC Logos (instead of Emojis)
const HOME_CARDS = [
  {
    id: 1,
    code: 102868,
    name: "HDFC Silver ETF FoF Direct-Growth",
    return: "+46.04%",
    period: "3Y",
    logo: getAmcLogo("hdfc"),
    bgColor: "#FFF5F5",
    color: "#EF4444",
    categories: ["Gold & Silver", "High return"],
  },
  {
    id: 2,
    code: 148784,
    name: "Bandhan Small Cap Fund",
    return: "+29.79%",
    period: "3Y",
    logo: getAmcLogo("bandhan"),
    bgColor: "#FFFDF0",
    color: "#D97706",
    categories: ["Small Cap", "High return", "Best SIP funds"],
  },
  {
    id: 3,
    code: 119063,
    name: "HDFC Mid Cap Fund",
    return: "+21.82%",
    period: "3Y",
    logo: getAmcLogo("hdfc"),
    bgColor: "#EEF2FF",
    color: "#4F46E5",
    categories: ["Mid Cap", "Best SIP funds"],
  },
  {
    id: 4,
    code: 122639,
    name: "Parag Parikh Flexi Cap Fund",
    return: "+15.19%",
    period: "3Y",
    logo: getAmcLogo("parag"),
    bgColor: "#ECFDF5",
    color: "#059669",
    categories: ["Large Cap", "Best SIP funds"],
  },
  {
    id: 5,
    code: 125497,
    name: "SBI Small Cap Fund",
    return: "+27.50%",
    period: "3Y",
    logo: getAmcLogo("sbi"),
    bgColor: "#F0FDF4",
    color: "#16A34A",
    categories: ["Small Cap", "High return"],
  },
  {
    id: 6,
    code: 120465,
    name: "Axis Bluechip Fund",
    return: "+18.20%",
    period: "3Y",
    logo: getAmcLogo("axis"),
    bgColor: "#F0F9FF",
    color: "#0284C7",
    categories: ["Large Cap", "Best SIP funds"],
  },
];

const COLLECTIONS = [
  { name: "High return", icon: "💵" },
  { name: "Best SIP funds", icon: "👛" },
  { name: "Gold & Silver", icon: "🪙" },
  { name: "Large Cap", icon: "🏢" },
  { name: "Mid Cap", icon: "🏠" },
  { name: "Small Cap", icon: "🏪" },
];

export function MutualFundPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("home"); // "home" | "all" | "search"
  const [loading, setLoading] = useState(false);
  const [sortingCriteria, setSortingCriteria] = useState("5year");

  // Dynamic tables list containers
  const [allFunds, setAllFunds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Pagination and scroll loading states
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  // Helper to retrieve NAV from historical list closest to years ago
  const getNavYearsAgo = (navHistory, years) => {
    if (!navHistory || navHistory.length === 0) return null;
    const latestDateStr = navHistory[0].date; // e.g. "25-06-2026"
    const parts = latestDateStr.split("-");
    const latestDate = new Date(parts[2], parts[1] - 1, parts[0]);

    const targetDate = new Date(latestDate);
    targetDate.setFullYear(latestDate.getFullYear() - years);

    let closestPoint = null;
    let minDiff = Infinity;

    for (const point of navHistory) {
      const pParts = point.date.split("-");
      const pDate = new Date(pParts[2], pParts[1] - 1, pParts[0]);
      const diff = Math.abs(pDate.getTime() - targetDate.getTime());

      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    }

    // Return if the closest date is within a reasonable offset (e.g. 45 days)
    if (minDiff > 45 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return parseFloat(closestPoint.nav);
  };

  // CAGR formula helper: (Math.pow((currentNav / pastNav), (1 / years)) - 1) * 100
  const calculateCAGR = (currentNav, pastNav, years) => {
    if (!currentNav || !pastNav || pastNav <= 0) return null;
    const cagr = (Math.pow(currentNav / pastNav, 1 / years) - 1) * 100;
    return parseFloat(cagr.toFixed(2));
  };

  // Helper function to fetch and compute NAV CAGR returns for an array of scheme codes
  const loadFundsDetail = async (schemesArray) => {
    const fetchedDetail = [];
    // Capped API call concurrency chunking
    const batchSize = 10;
    for (let i = 0; i < schemesArray.length; i += batchSize) {
      const batch = schemesArray.slice(i, i + batchSize);
      const promises = batch.map(async (scheme) => {
        try {
          const res = await fetch(`https://api.mfapi.in/mf/${scheme.code || scheme.schemeCode}`);
          if (!res.ok) return null;
          const json = await res.json();
          if (!json || !json.data || json.data.length === 0) return null;

          const currentNav = parseFloat(json.data[0].nav);
          const nav1Y = getNavYearsAgo(json.data, 1);
          const nav3Y = getNavYearsAgo(json.data, 3);
          const nav5Y = getNavYearsAgo(json.data, 5);

          const cagr1Y = calculateCAGR(currentNav, nav1Y, 1);
          const cagr3Y = calculateCAGR(currentNav, nav3Y, 3);
          const cagr5Y = calculateCAGR(currentNav, nav5Y, 5);

          const schemeName = json.meta.scheme_name;
          const fundHouse = json.meta.fund_house;

          return {
            code: json.meta.scheme_code,
            name: schemeName,
            fundHouse: fundHouse,
            logo: getAmcLogo(fundHouse || schemeName),
            currentNav: currentNav,
            cagr1Y: cagr1Y,
            cagr3Y: cagr3Y,
            cagr5Y: cagr5Y,
            risk: getRiskCategory(schemeName),
          };
        } catch (err) {
          console.error("Error fetching detail for", scheme, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      results.forEach((r) => {
        if (r) fetchedDetail.push(r);
      });
    }
    return fetchedDetail;
  };

  // Load the first 15 schemes for tabular presentation
  const load30MutualFunds = async () => {
    setLoading(true);
    setViewMode("all");
    setLoadedCount(15);
    try {
      const first15 = POPULAR_30_SCHEMES.slice(0, 15);
      const data = await loadFundsDetail(first15);
      setAllFunds(data);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch mutual fund details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFunds = async () => {
    if (loading || loadingMore || loadedCount >= POPULAR_30_SCHEMES.length) return;
    setLoadingMore(true);
    const nextLimit = Math.min(loadedCount + 5, POPULAR_30_SCHEMES.length);
    const nextBatch = POPULAR_30_SCHEMES.slice(loadedCount, nextLimit);
    try {
      const data = await loadFundsDetail(nextBatch);
      setAllFunds((prev) => [...prev, ...data]);
      setLoadedCount(nextLimit);
    } catch (e) {
      console.error("Error loading more funds", e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "all" || loadedCount >= POPULAR_30_SCHEMES.length || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFunds();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [viewMode, loadedCount, loading, loadingMore]);

  // Search button functionality: fetches matching scheme codes from mfapi.in and resolves details
  const handleSearchClick = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a mutual fund name to search");
      return;
    }
    setLoading(true);
    setViewMode("search");
    setSelectedCategory(null); // Clear category filter during active searches
    try {
      const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search request failed");
      const list = await res.json();

      if (!list || list.length === 0) {
        setSearchResults([]);
        return;
      }

      // Cap detailed lookup to top 8 similar items to optimize fetch performance
      const topMatches = list.slice(0, 8);
      const data = await loadFundsDetail(topMatches);
      setSearchResults(data);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      setSearchQuery("");
      setViewMode("home");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setViewMode("home");
  };

  // Sorting logic based on selected dropdown sorting criteria
  const getSortedFunds = (fundsList) => {
    return [...fundsList].sort((a, b) => {
      if (sortingCriteria === "1year") {
        return (b.cagr1Y ?? -999) - (a.cagr1Y ?? -999);
      } else if (sortingCriteria === "3year") {
        return (b.cagr3Y ?? -999) - (a.cagr3Y ?? -999);
      } else if (sortingCriteria === "5year") {
        return (b.cagr5Y ?? -999) - (a.cagr5Y ?? -999);
      } else if (sortingCriteria === "risk") {
        const riskWeights = { High: 3, Mid: 2, Low: 1 };
        const weightA = riskWeights[a.risk] || 0;
        const weightB = riskWeights[b.risk] || 0;
        return weightB - weightA;
      }
      return 0;
    });
  };

  // Filter local HOME_CARDS list based on selected category tags
  const filteredHomeCards = HOME_CARDS.filter((fund) => {
    const matchesSearch = fund.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? fund.categories.includes(selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout pageTitle="Mutual Funds">
      {/* Search Input Bar with Rounded Borders and Search Button */}
      <div className="mf-search-wrapper">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="mf-search-container" style={{ flexGrow: 1 }}>
            <span className="mf-search-icon">🔍</span>
            <input
              type="text"
              className="mf-search-input"
              placeholder="Search mutual fund"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#9CA3AF",
                  marginRight: "6px",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className="mf-search-btn"
            onClick={handleSearchClick}
            disabled={loading}
          >
            {loading && viewMode === "search" ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Selected Category Tag */}
        {selectedCategory && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>
              Filtering by category:
            </span>
            <span
              style={{
                backgroundColor: "rgba(108, 58, 237, 0.1)",
                color: "var(--mf-accent-purple)",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--mf-accent-purple)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      {/* VIEW: HOME VIEW (Default curated list and collections) */}
      {viewMode === "home" && (
        <>
          <div className="mf-section-header">
            <h2 className="mf-section-title">Popular Funds</h2>
            <button
              type="button"
              className="mf-section-link"
              onClick={load30MutualFunds}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              All Mutual Funds <span>➔</span>
            </button>
          </div>

          {filteredHomeCards.length > 0 ? (
            <div className="mf-cards-grid">
              {filteredHomeCards.map((fund) => (
                <div
                  key={fund.id}
                  className="mf-fund-card"
                  onClick={() => navigate(`/mutual-fund/${fund.code}`)}
                >
                  <div>
                    <div className="mf-card-header">
                      <img
                        src={fund.logo}
                        alt={fund.name}
                        className="mf-table-logo"
                        style={{ width: "42px", height: "42px" }}
                      />
                      <h3 className="mf-card-fund-name">{fund.name}</h3>
                    </div>
                  </div>
                  <div className="mf-card-footer">
                    <span className="mf-card-return">{fund.return}</span>
                    <span className="mf-card-period">{fund.period}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mf-empty-state" style={{ marginBottom: "40px" }}>
              <div className="mf-empty-icon">🔍</div>
              <div className="mf-empty-title">No popular funds found</div>
              <div className="mf-empty-text">No curated popular funds match this filter.</div>
              <button
                onClick={handleReset}
                style={{
                  marginTop: "16px",
                  backgroundColor: "var(--mf-accent-purple)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Collections Section */}
          <div className="mf-section-header" style={{ marginTop: "16px" }}>
            <h2 className="mf-section-title">Collections</h2>
          </div>

          <div className="mf-collections-grid">
            {COLLECTIONS.map((col) => {
              const isSelected = selectedCategory === col.name;
              return (
                <div
                  key={col.name}
                  className="mf-collection-card"
                  onClick={() => handleCollectionClick(col.name)}
                  style={
                    isSelected
                      ? {
                        borderColor: "var(--mf-accent-purple)",
                        backgroundColor: "rgba(108, 58, 237, 0.03)",
                      }
                      : {}
                  }
                >
                  <div className="mf-collection-icon-box">{col.icon}</div>
                  <span className="mf-collection-name">{col.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* LOADING STATE VIEW */}
      {loading && viewMode !== "home" && (
        <div className="mf-loader-container">
          <div className="mf-spinner" />
          <div className="mf-loader-text">
            {viewMode === "all"
              ? "Fetching details for 30 mutual funds from API..."
              : `Searching similar schemes for "${searchQuery}"...`}
          </div>
        </div>
      )}

      {/* VIEW: ALL 30 MUTUAL FUNDS TABULAR VIEW */}
      {!loading && viewMode === "all" && (
        <>
          <div className="mf-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button type="button" className="mf-back-btn" onClick={handleReset}>
                ← Back
              </button>
              <h2 className="mf-section-title">All Mutual Funds (Popular 30)</h2>
            </div>

            {/* Sort Dropdown */}
            <div className="mf-sort-wrapper">
              <span className="mf-sort-label">Sort by:</span>
              <select
                className="mf-sort-select"
                value={sortingCriteria}
                onChange={(e) => setSortingCriteria(e.target.value)}
              >
                <option value="5year">5Y CAGR Return</option>
                <option value="3year">3Y CAGR Return</option>
                <option value="1year">1Y CAGR Return</option>
                <option value="risk">Risk Category</option>
              </select>
            </div>
          </div>

          <div className="mf-table-container">
            <table className="mf-table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Latest NAV</th>
                  <th>1Y CAGR</th>
                  <th>3Y CAGR</th>
                  <th>5Y CAGR</th>
                  <th>Risk Category</th>
                </tr>
              </thead>
              <tbody>
                {getSortedFunds(allFunds).map((fund) => (
                  <tr key={fund.code}>
                    <td>
                      <div
                        className="mf-table-logo-box"
                        onClick={() => navigate(`/mutual-fund/${fund.code}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <img src={fund.logo} alt={fund.name} className="mf-table-logo" />
                        <span style={{ fontWeight: 600 }}>{fund.name}</span>
                      </div>
                    </td>
                    <td>₹{fund.currentNav.toFixed(2)}</td>
                    <td style={{ color: fund.cagr1Y >= 0 ? "#10B981" : "#EF4444" }}>
                      {fund.cagr1Y !== null ? `${fund.cagr1Y}%` : "--"}
                    </td>
                    <td style={{ color: fund.cagr3Y >= 0 ? "#10B981" : "#EF4444" }}>
                      {fund.cagr3Y !== null ? `${fund.cagr3Y}%` : "--"}
                    </td>
                    <td style={{ color: fund.cagr5Y >= 0 ? "#10B981" : "#EF4444" }}>
                      {fund.cagr5Y !== null ? `${fund.cagr5Y}%` : "--"}
                    </td>
                    <td>
                      <span className={`mf-badge mf-badge-${fund.risk.toLowerCase()}`}>
                        {fund.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Infinite Scroll Loader Target */}
            {loadedCount < POPULAR_30_SCHEMES.length && (
              <div
                ref={loaderRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                  background: "#FAFBFD",
                  borderTop: "1px solid var(--mf-border-color)"
                }}
              >
                {loadingMore ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="mf-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", margin: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>
                      Loading more mutual funds...
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>
                    Scroll down to load more
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW: SEARCH RESULTS TABULAR VIEW */}
      {!loading && viewMode === "search" && (
        <>
          <div className="mf-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button type="button" className="mf-back-btn" onClick={handleReset}>
                ← Clear Search
              </button>
              <h2 className="mf-section-title">Similar Schemes for &quot;{searchQuery}&quot;</h2>
            </div>

            {/* Sort Dropdown */}
            {searchResults.length > 0 && (
              <div className="mf-sort-wrapper">
                <span className="mf-sort-label">Sort by:</span>
                <select
                  className="mf-sort-select"
                  value={sortingCriteria}
                  onChange={(e) => setSortingCriteria(e.target.value)}
                >
                  <option value="5year">5Y CAGR Return</option>
                  <option value="3year">3Y CAGR Return</option>
                  <option value="1year">1Y CAGR Return</option>
                  <option value="risk">Risk Category</option>
                </select>
              </div>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="mf-table-container">
              <table className="mf-table">
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>Latest NAV</th>
                    <th>1Y CAGR</th>
                    <th>3Y CAGR</th>
                    <th>5Y CAGR</th>
                    <th>Risk Category</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedFunds(searchResults).map((fund) => (
                    <tr key={fund.code}>
                      <td>
                        <div
                          className="mf-table-logo-box"
                          onClick={() => navigate(`/mutual-fund/${fund.code}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={fund.logo} alt={fund.name} className="mf-table-logo" />
                          <span style={{ fontWeight: 600 }}>{fund.name}</span>
                        </div>
                      </td>
                      <td>₹{fund.currentNav.toFixed(2)}</td>
                      <td style={{ color: fund.cagr1Y >= 0 ? "#10B981" : "#EF4444" }}>
                        {fund.cagr1Y !== null ? `${fund.cagr1Y}%` : "--"}
                      </td>
                      <td style={{ color: fund.cagr3Y >= 0 ? "#10B981" : "#EF4444" }}>
                        {fund.cagr3Y !== null ? `${fund.cagr3Y}%` : "--"}
                      </td>
                      <td style={{ color: fund.cagr5Y >= 0 ? "#10B981" : "#EF4444" }}>
                        {fund.cagr5Y !== null ? `${fund.cagr5Y}%` : "--"}
                      </td>
                      <td>
                        <span className={`mf-badge mf-badge-${fund.risk.toLowerCase()}`}>
                          {fund.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mf-empty-state">
              <div className="mf-empty-icon">🔍</div>
              <div className="mf-empty-title">No similar schemes found</div>
              <div className="mf-empty-text">
                We couldn&apos;t find any schemes on mfapi.in matching &quot;{searchQuery}&quot;.
              </div>
              <button
                onClick={handleReset}
                style={{
                  marginTop: "16px",
                  backgroundColor: "var(--mf-accent-purple)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Reset Search
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default MutualFundPage;
