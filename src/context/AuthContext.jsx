import { createContext, useContext, useState } from "react";
import { useApi } from "./ApiContext";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { post } = useApi();
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_admin")) || null; }
    catch { return null; }
  });

  async function login(email, password) {
    const data = await post({ action: "adminLogin", email, password });
    if (data.success) {
      const adminData = { token: data.token, name: data.name, role: data.role };
      localStorage.setItem("sf_admin", JSON.stringify(adminData));
      setAdmin(adminData);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem("sf_admin");
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}