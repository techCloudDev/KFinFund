import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "./api";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

const KycContext = createContext({
  kycStatus: null,
  kycData: null,
  refreshKyc: () => {},
});

// ✅ Single source of truth for KYC status across the whole app.
// Only THIS provider fetches /api/kyc/status — every page reads from
// here instead of independently fetching + writing to a shared cache.
// This eliminates the race condition where multiple components could
// overwrite each other's correct value with a stale/failed one.
export function KycProvider({ children }) {
  const [kycStatus, setKycStatus] = useState(() => localStorage.getItem("kycStatus") || null);
  const [kycData, setKycData] = useState(null);

  const refreshKyc = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) { setKycStatus(null); return; }

    apiFetch(`${KYC_SERVICE_URL}/api/kyc/status`)
      .then(r => r.json())
      .then(d => {
        const status = d.status || "NOT_SUBMITTED";
        setKycStatus(status);
        localStorage.setItem("kycStatus", status);
        // Fetch full KYC record only when there's something to show
        if (status === "PENDING" || status === "APPROVED") {
          apiFetch(`${KYC_SERVICE_URL}/api/kyc`)
            .then(r => r.json()).then(setKycData).catch(() => {});
        }
      })
      .catch(() => {
        // ✅ On any failure (network blip, transient 429, etc) — keep
        // whatever value is already in state/localStorage. Never silently
        // downgrade an APPROVED status to NOT_SUBMITTED on a failed fetch.
        const cached = localStorage.getItem("kycStatus");
        if (cached) setKycStatus(cached);
      });
  }, []);

  // Fetch once on mount (covers login, page refresh, app load)
  useEffect(() => {
    refreshKyc();
  }, [refreshKyc]);

  return (
    <KycContext.Provider value={{ kycStatus, kycData, refreshKyc }}>
      {children}
    </KycContext.Provider>
  );
}

export function useKyc() {
  return useContext(KycContext);
}