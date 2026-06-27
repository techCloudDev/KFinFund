import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../component/DashboardLayout";
import PublicLayout from "../component/PublicLayout";
import "../mutual-fund.css";
import { AMC_LOGOS } from "../component/amc_logo";

const getAmcLogo = (name = "") => {
  const normalized = name.toLowerCase();
  for (const key in AMC_LOGOS) {
    if (normalized.includes(key)) {
      return AMC_LOGOS[key];
    }
  }
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

const getRiskCategory = (schemeName = "") => {
  const name = schemeName.toLowerCase();
  if (name.includes("liquid") || name.includes("arbitrage") || name.includes("overnight") || name.includes("debt") || name.includes("treasury")) {
    return "Low";
  } else if (name.includes("hybrid") || name.includes("balanced") || name.includes("conservative") || name.includes("allocator")) {
    return "Mid";
  } else {
    return "High";
  }
};

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

const HOME_CARDS = [
  { id: 1, code: 102868, name: "HDFC Silver ETF FoF Direct-Growth", return: "+46.04%", period: "3Y", logo: getAmcLogo("hdfc"), bgColor: "#FFF5F5", color: "#EF4444", categories: ["Gold & Silver", "High return"] },
  { id: 2, code: 148784, name: "Bandhan Small Cap Fund", return: "+29.79%", period: "3Y", logo: getAmcLogo("bandhan"), bgColor: "#FFFDF0", color: "#D97706", categories: ["Small Cap", "High return", "Best SIP funds"] },
  { id: 3, code: 119063, name: "HDFC Mid Cap Fund", return: "+21.82%", period: "3Y", logo: getAmcLogo("hdfc"), bgColor: "#EEF2FF", color: "#4F46E5", categories: ["Mid Cap", "Best SIP funds"] },
  { id: 4, code: 122639, name: "Parag Parikh Flexi Cap Fund", return: "+15.19%", period: "3Y", logo: getAmcLogo("parag"), bgColor: "#ECFDF5", color: "#059669", categories: ["Large Cap", "Best SIP funds"] },
  { id: 5, code: 125497, name: "SBI Small Cap Fund", return: "+27.50%", period: "3Y", logo: getAmcLogo("sbi"), bgColor: "#F0FDF4", color: "#16A34A", categories: ["Small Cap", "High return"] },
  { id: 6, code: 120465, name: "Axis Bluechip Fund", return: "+18.20%", period: "3Y", logo: getAmcLogo("axis"), bgColor: "#F0F9FF", color: "#0284C7", categories: ["Large Cap", "Best SIP funds"] },
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
  const isLoggedIn = !!localStorage.getItem("token");
  const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const categoryParam = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("home");
  const [loading, setLoading] = useState(false);
  const [sortingCriteria, setSortingCriteria] = useState("5year");
  const [allFunds, setAllFunds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem("watchlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isWatchlisted = (code) => watchlist.some((item) => String(item.code) === String(code));

  const toggleWatchlist = (fund) => {
    if (!isLoggedIn) { navigate("/login"); return; }
    let updated;
    if (isWatchlisted(fund.code)) {
      updated = watchlist.filter((item) => String(item.code) !== String(fund.code));
    } else {
      updated = [...watchlist, {
        code: fund.code, name: fund.name, fundHouse: fund.fundHouse || "",
        category: fund.category || "Mutual Fund", type: fund.type || "Open Ended",
        logo: fund.logo, risk: fund.risk,
        currentNav: fund.currentNav || parseFloat(fund.return?.replace(/[^0-9.]/g, "")) || 100,
        cagr3Y: fund.cagr3Y !== undefined ? fund.cagr3Y : 20
      }];
    }
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const getNavYearsAgo = (navHistory, years) => {
    if (!navHistory || navHistory.length === 0) return null;
    const latestDateStr = navHistory[0].date;
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
      if (diff < minDiff) { minDiff = diff; closestPoint = point; }
    }
    if (minDiff > 45 * 24 * 60 * 60 * 1000) return null;
    return parseFloat(closestPoint.nav);
  };

  const calculateCAGR = (currentNav, pastNav, years) => {
    if (!currentNav || !pastNav || pastNav <= 0) return null;
    return parseFloat(((Math.pow(currentNav / pastNav, 1 / years) - 1) * 100).toFixed(2));
  };

  const loadFundsDetail = async (schemesArray) => {
    const fetchedDetail = [];
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
          const schemeName = json.meta.scheme_name;
          const fundHouse = json.meta.fund_house;
          return {
            code: json.meta.scheme_code, name: schemeName, fundHouse,
            logo: getAmcLogo(fundHouse || schemeName), currentNav,
            cagr1Y: calculateCAGR(currentNav, nav1Y, 1),
            cagr3Y: calculateCAGR(currentNav, nav3Y, 3),
            cagr5Y: calculateCAGR(currentNav, nav5Y, 5),
            risk: getRiskCategory(schemeName),
          };
        } catch (err) { console.error("Error fetching detail for", scheme, err); return null; }
      });
      const results = await Promise.all(promises);
      results.forEach((r) => { if (r) fetchedDetail.push(r); });
    }
    return fetchedDetail;
  };

  const load30MutualFunds = async () => {
    setLoading(true); setViewMode("all"); setLoadedCount(15);
    try {
      const data = await loadFundsDetail(POPULAR_30_SCHEMES.slice(0, 15));
      setAllFunds(data);
    } catch (e) { console.error(e); alert("Failed to fetch mutual fund details."); }
    finally { setLoading(false); }
  };

  const loadMoreFunds = async () => {
    if (loading || loadingMore || loadedCount >= POPULAR_30_SCHEMES.length) return;
    setLoadingMore(true);
    const nextLimit = Math.min(loadedCount + 5, POPULAR_30_SCHEMES.length);
    try {
      const data = await loadFundsDetail(POPULAR_30_SCHEMES.slice(loadedCount, nextLimit));
      setAllFunds((prev) => [...prev, ...data]);
      setLoadedCount(nextLimit);
    } catch (e) { console.error("Error loading more funds", e); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => {
    if (viewMode !== "all" || loadedCount >= POPULAR_30_SCHEMES.length || loading || loadingMore) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMoreFunds(); }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
  }, [viewMode, loadedCount, loading, loadingMore]);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) { alert("Please enter a mutual fund name to search"); return; }
    setLoading(true); setViewMode("search"); setSelectedCategory(null);
    try {
      const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search request failed");
      const list = await res.json();
      if (!list || list.length === 0) { setSearchResults([]); return; }
      const data = await loadFundsDetail(list.slice(0, 8));
      setSearchResults(data);
    } catch (e) { console.error(e); setSearchResults([]); }
    finally { setLoading(false); }
  };

  const handleCollectionClick = (categoryName) => {
    if (selectedCategory === categoryName) { setSelectedCategory(null); }
    else { setSelectedCategory(categoryName); setSearchQuery(""); setViewMode("home"); }
  };

  const handleReset = () => { setSearchQuery(""); setSelectedCategory(null); setViewMode("home"); };

  useEffect(() => {
    if (categoryParam === "top") {
      setSortingCriteria("5year");
      load30MutualFunds();
    } else if (categoryParam === "nfo") {
      setViewMode("nfo");
    } else if (categoryParam) {
      const categoryMap = {
        largecap: "Large Cap",
        midcap: "Mid Cap",
        smallcap: "Small Cap",
        flexicap: "Flexi Cap",
        liquid: "Liquid Fund",
        elss: "Tax Saving (ELSS)",
        commodity: "Commodity",
      };
      const mapped = categoryMap[categoryParam];
      if (mapped) setSelectedCategory(mapped);
    }
  }, [categoryParam]);

  const getSortedFunds = (fundsList) => {
    return [...fundsList].sort((a, b) => {
      if (sortingCriteria === "1year") return (b.cagr1Y ?? -999) - (a.cagr1Y ?? -999);
      if (sortingCriteria === "3year") return (b.cagr3Y ?? -999) - (a.cagr3Y ?? -999);
      if (sortingCriteria === "5year") return (b.cagr5Y ?? -999) - (a.cagr5Y ?? -999);
      if (sortingCriteria === "risk") {
        const w = { High: 3, Mid: 2, Low: 1 };
        return (w[b.risk] || 0) - (w[a.risk] || 0);
      }
      return 0;
    });
  };

  const filteredHomeCards = HOME_CARDS.filter((fund) => {
    const matchesSearch = fund.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? fund.categories.includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  const BookmarkIcon = ({ code }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill={isWatchlisted(code) ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );

  const content = (
    <>
      {/* Search */}
      <div className="mf-search-wrapper">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="mf-search-container" style={{ flexGrow: 1 }}>
            <span className="mf-search-icon">🔍</span>
            <input type="text" className="mf-search-input" placeholder="Search mutual fund"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9CA3AF", marginRight: "6px" }}>✕</button>
            )}
          </div>
          <button type="button" className="mf-search-btn" onClick={handleSearchClick} disabled={loading}>
            {loading && viewMode === "search" ? "Searching..." : "Search"}
          </button>
        </div>
        {selectedCategory && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>Filtering by category:</span>
            <span style={{ backgroundColor: "rgba(108, 58, 237, 0.1)", color: "var(--mf-accent-purple)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--mf-accent-purple)", padding: 0, display: "flex", alignItems: "center" }}>✕</button>
            </span>
          </div>
        )}
      </div>

      {/* HOME VIEW */}
      {viewMode === "home" && (
        <>
          <div className="mf-section-header">
            <h2 className="mf-section-title">Popular Funds</h2>
            <button type="button" className="mf-section-link" onClick={load30MutualFunds} style={{ background: "none", border: "none", cursor: "pointer" }}>
              All Mutual Funds <span>➔</span>
            </button>
          </div>
          {filteredHomeCards.length > 0 ? (
            <div className="mf-cards-grid">
              {filteredHomeCards.map((fund) => (
                <div key={fund.id} className="mf-fund-card"
                  onClick={() => { if (!isLoggedIn) { navigate("/login"); return; } navigate(`/mutual-fund/${fund.code}`); }}
                  style={{ position: "relative" }}>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist({ code: fund.code, name: fund.name, logo: fund.logo, risk: "High", currentNav: 120, cagr3Y: 20 }); }}
                    style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: isWatchlisted(fund.code) ? "#EF4444" : "#9CA3AF", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}>
                    <BookmarkIcon code={fund.code} />
                  </button>
                  <div>
                    <div className="mf-card-header">
                      <img src={fund.logo} alt={fund.name} className="mf-table-logo" style={{ width: "42px", height: "42px" }} />
                      <h3 className="mf-card-fund-name" style={{ paddingRight: "20px" }}>{fund.name}</h3>
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
              <button onClick={handleReset} style={{ marginTop: "16px", backgroundColor: "var(--mf-accent-purple)", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Reset Filters</button>
            </div>
          )}
          <div className="mf-section-header" style={{ marginTop: "16px" }}>
            <h2 className="mf-section-title">Collections</h2>
          </div>
          <div className="mf-collections-grid">
            {COLLECTIONS.map((col) => {
              const isSelected = selectedCategory === col.name;
              return (
                <div key={col.name} className="mf-collection-card" onClick={() => handleCollectionClick(col.name)}
                  style={isSelected ? { borderColor: "var(--mf-accent-purple)", backgroundColor: "rgba(108, 58, 237, 0.03)" } : {}}>
                  <div className="mf-collection-icon-box">{col.icon}</div>
                  <span className="mf-collection-name">{col.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* LOADING */}
{loading && viewMode !== "home" && (
  <div style={{ padding: "20px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", padding: "12px 16px", background: "#f3f0ff", borderRadius: "10px", border: "1px solid #e0d7ff" }}>
      <div className="mf-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", margin: 0, flexShrink: 0 }} />
      <span style={{ fontSize: "14px", color: "#6C3AED", fontWeight: "600" }}>
  {viewMode === "search" ? `Searching for "${searchQuery}"...` : "Loading..."}
</span>
    </div>
    {/* Skeleton rows */}
    {[1,2,3,4,5].map((i) => (
      <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", borderBottom: "1px solid #f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e5e7eb", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: "14px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "8px", width: "60%" }} />
          <div style={{ height: "12px", background: "#f3f4f6", borderRadius: "6px", width: "40%" }} />
        </div>
        <div style={{ width: "60px", height: "14px", background: "#e5e7eb", borderRadius: "6px" }} />
        <div style={{ width: "60px", height: "14px", background: "#e5e7eb", borderRadius: "6px" }} />
        <div style={{ width: "60px", height: "14px", background: "#e5e7eb", borderRadius: "6px" }} />
      </div>
    ))}
  </div>
)}

      {/* ALL FUNDS TABLE */}
      {!loading && viewMode === "all" && (
        <>
          <div className="mf-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button type="button" className="mf-back-btn" onClick={handleReset}>← Back</button>
              <h2 className="mf-section-title">All Mutual Funds (Popular 30)</h2>
            </div>
            <div className="mf-sort-wrapper">
              <span className="mf-sort-label">Sort by:</span>
              <select className="mf-sort-select" value={sortingCriteria} onChange={(e) => setSortingCriteria(e.target.value)}>
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
                  <th>Scheme Name</th><th>Latest NAV</th><th>1Y CAGR</th><th>3Y CAGR</th><th>5Y CAGR</th><th>Risk Category</th><th style={{ textAlign: "center" }}>Watchlist</th>
                </tr>
              </thead>
              <tbody>
                {getSortedFunds(allFunds).map((fund) => (
                  <tr key={fund.code}>
                    <td>
                      <div className="mf-table-logo-box"
                        onClick={() => { if (!isLoggedIn) { navigate("/login"); return; } navigate(`/mutual-fund/${fund.code}`); }}
                        style={{ cursor: "pointer" }}>
                        <img src={fund.logo} alt={fund.name} className="mf-table-logo" />
                        <span style={{ fontWeight: 600 }}>{fund.name}</span>
                      </div>
                    </td>
                    <td>₹{fund.currentNav.toFixed(2)}</td>
                    <td style={{ color: fund.cagr1Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr1Y !== null ? `${fund.cagr1Y}%` : "--"}</td>
                    <td style={{ color: fund.cagr3Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr3Y !== null ? `${fund.cagr3Y}%` : "--"}</td>
                    <td style={{ color: fund.cagr5Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr5Y !== null ? `${fund.cagr5Y}%` : "--"}</td>
                    <td><span className={`mf-badge mf-badge-${fund.risk.toLowerCase()}`}>{fund.risk}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleWatchlist(fund); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: isWatchlisted(fund.code) ? "#EF4444" : "#9CA3AF", padding: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}>
                        <BookmarkIcon code={fund.code} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loadedCount < POPULAR_30_SCHEMES.length && (
              <div ref={loaderRef} style={{ display: "flex", justifyContent: "center", padding: "20px", background: "#FAFBFD", borderTop: "1px solid var(--mf-border-color)" }}>
                {loadingMore ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="mf-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", margin: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>Loading more mutual funds...</span>
                  </div>
                ) : (
                  <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>Scroll down to load more</span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* SEARCH RESULTS */}
      {!loading && viewMode === "search" && (
        <>
          <div className="mf-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button type="button" className="mf-back-btn" onClick={handleReset}>← Clear Search</button>
              <h2 className="mf-section-title">Similar Schemes for &quot;{searchQuery}&quot;</h2>
            </div>
            {searchResults.length > 0 && (
              <div className="mf-sort-wrapper">
                <span className="mf-sort-label">Sort by:</span>
                <select className="mf-sort-select" value={sortingCriteria} onChange={(e) => setSortingCriteria(e.target.value)}>
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
                    <th>Scheme Name</th><th>Latest NAV</th><th>1Y CAGR</th><th>3Y CAGR</th><th>5Y CAGR</th><th>Risk Category</th><th style={{ textAlign: "center" }}>Watchlist</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedFunds(searchResults).map((fund) => (
                    <tr key={fund.code}>
                      <td>
                        <div className="mf-table-logo-box"
                          onClick={() => { if (!isLoggedIn) { navigate("/login"); return; } navigate(`/mutual-fund/${fund.code}`); }}
                          style={{ cursor: "pointer" }}>
                          <img src={fund.logo} alt={fund.name} className="mf-table-logo" />
                          <span style={{ fontWeight: 600 }}>{fund.name}</span>
                        </div>
                      </td>
                      <td>₹{fund.currentNav.toFixed(2)}</td>
                      <td style={{ color: fund.cagr1Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr1Y !== null ? `${fund.cagr1Y}%` : "--"}</td>
                      <td style={{ color: fund.cagr3Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr3Y !== null ? `${fund.cagr3Y}%` : "--"}</td>
                      <td style={{ color: fund.cagr5Y >= 0 ? "#10B981" : "#EF4444" }}>{fund.cagr5Y !== null ? `${fund.cagr5Y}%` : "--"}</td>
                      <td><span className={`mf-badge mf-badge-${fund.risk.toLowerCase()}`}>{fund.risk}</span></td>
                      <td style={{ textAlign: "center" }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleWatchlist(fund); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: isWatchlisted(fund.code) ? "#EF4444" : "#9CA3AF", padding: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}>
                          <BookmarkIcon code={fund.code} />
                        </button>
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
              <div className="mf-empty-text">We couldn&apos;t find any schemes on mfapi.in matching &quot;{searchQuery}&quot;.</div>
              <button onClick={handleReset} style={{ marginTop: "16px", backgroundColor: "var(--mf-accent-purple)", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Reset Search</button>
            </div>
          )}
        </>
      )}
    {/* NFO VIEW */}
      {viewMode === "nfo" && (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>New Fund Offers (NFO)</div>
          <div style={{ fontSize: "14px", color: "#6b7280", maxWidth: "400px", margin: "0 auto 24px" }}>
            No active NFOs at the moment. New fund offers will appear here when available.
          </div>
          <button onClick={handleReset} style={{ backgroundColor: "var(--mf-accent-purple)", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            Browse Existing Funds
          </button>
        </div>
      )}
    </>
  );

  return isLoggedIn ? (
    <DashboardLayout pageTitle="Mutual Funds">{content}</DashboardLayout>
  ) : (
    <PublicLayout pageTitle="Mutual Funds">{content}</PublicLayout>
  );
}

export default MutualFundPage;