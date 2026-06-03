import React, { createContext, useState, useContext, useEffect } from "react";
import * as API from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("crm_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("crm_token") || null
  );

  const [loading, setLoading] = useState(false);
 useEffect(() => {
    const savedUser = localStorage.getItem("crm_user");
    const savedToken = localStorage.getItem("crm_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);
const login = async (email, password) => {
  setLoading(true);

  try {
    const response = await API.logg({
      email,
      password,
    });


  const userData = response?.data?.user;
    const token = response?.data?.token;
    if (!token) {
      throw new Error("Token missing from server response");
    }if (!userData?.role) {
      throw new Error("Role missing from server response");
    }
    localStorage.setItem("crm_token", token);
    localStorage.setItem("crm_user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    return userData;

  } catch (error) {

 const message =
  error?.message ||
  error?.response?.data?.message ||
  "Login failed";

    throw new Error(message);

  } finally {
    setLoading(false);
  }
};
  const signup = async (name, email, password, company) => {
    setLoading(true);
    try {
      const res = await API.regg({ name, email, password, companyName: company });

      const jwt = res.data.token;
      const raw = res.data.user;
      const userData = raw?.user ?? raw;

      if (!userData?.role) {
        throw new Error("Invalid response from server: role missing");
      }

      localStorage.setItem("crm_token", jwt);
      localStorage.setItem("crm_user", JSON.stringify(userData));

      setToken(jwt);
      setUser(userData);

      return userData;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setToken(null);
    setUser(null);
  };
  const updateUser = (newData) => {
  setUser((prev) => ({
    ...prev,
    ...newData,
  }));

  localStorage.setItem(
    "crm_user",
    JSON.stringify({
      ...JSON.parse(localStorage.getItem("crm_user")),
      ...newData,
    })
  );
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        loading,
        updateUser,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === "superadmin",
        isAdmin: user?.role === "admin",
        isUser: user?.role === "user",
      }}
    >
      
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);