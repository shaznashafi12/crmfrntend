import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext.jsx";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Company from "./components/Company.jsx";
import SuperAdminDashboard from "./pages/Sdashboard.jsx";
import AdminDashboard from "./pages/Dashboard.jsx";
import UserDashboard from "./pages/Udashboard.jsx";
import SuperUsers from "./pages/Superusers.jsx";
import SuperSubscriptions from "./pages/Supersubscriptions.jsx";

import Leads from "./pages/Leads.jsx";
import Deals from "./pages/Deals.jsx";
import Team from "./pages/Team.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[72px]" : "ml-64"
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const RL = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/superadmin" element={<RL roles={["superadmin"]}><SuperAdminDashboard /></RL>} />
          <Route path="/companies" element={<RL roles={["superadmin"]}><Company /></RL>} />
          <Route path="/users" element={<RL roles={["superadmin"]}><SuperUsers /></RL>} />
          <Route path="/subscriptions" element={<RL roles={["superadmin"]}><SuperSubscriptions /></RL>} />

          <Route path="/admin" element={<RL roles={["admin"]}><AdminDashboard /></RL>} />
          <Route path="/team" element={<RL roles={["admin"]}><Team /></RL>} />

          <Route path="/dashboard" element={<RL roles={["user"]}><UserDashboard /></RL>} />

          <Route path="/leads" element={<RL roles={["user", "admin"]}><Leads /></RL>} />
          <Route path="/deals" element={<RL roles={["user", "admin"]}><Deals /></RL>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;