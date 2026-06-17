import { createContext, useContext, useState, useEffect } from "react";

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

// ⚠️ এখানে তোমার Apps Script URL বসাও
export const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://script.google.com/macros/s/AKfycbxwj04hgvfEbt2SVwcNpybwEZFtKk12m2DUKGMOP9x9JbSAd0vIjnqJICtUZTBs_fp23Q/exec";

export function ApiProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchNotices()])
      .finally(() => setLoading(false));
  }, []);

  async function fetchSettings() {
    try {
      const res  = await fetch(`${API_URL}?action=getSettings`);
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch(e) { console.error("Settings fetch failed", e); }
  }

  async function fetchNotices() {
    try {
      const res  = await fetch(`${API_URL}?action=getNotices`);
      const data = await res.json();
      if (data.success) setNotices(data.data);
    } catch(e) { console.error("Notices fetch failed", e); }
  }

  async function post(payload) {
    const res = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  return (
    <ApiContext.Provider value={{ settings, notices, loading, fetchSettings, fetchNotices, post }}>
      {children}
    </ApiContext.Provider>
  );
}