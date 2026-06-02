import React, { useState } from "react";
import bg from "../assets/bggggggg.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const userData = await login(form.email, form.password);

      if (!userData?.role) {
        toast.error("Role missing from server response");
        return;
      }

      toast.success("Login successful 🚀");

      if (userData.role === "superadmin") {
        navigate("/superadmin");
      } else if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="flex min-h-screen w-full">

        <div className="hidden md:flex md:w-1/2 md:-ml-32 md:-mt-52 items-center justify-center text-white">
          <div className="text-left px-16">
            <h1 className="text-5xl font-bold mb-2">Welcome Back</h1>
            <p className="text-lg font-medium mb-2">
              Access Your CRM Dashboard
            </p>
            <p className="text-sm opacity-90 leading-relaxed max-w-sm">
              Continue managing your customers, track leads, and stay on top of your business performance.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md px-6">

            <h2 className="text-3xl font-bold text-[#2FA77A] text-center mb-8">
              Sign In
            </h2>

            <div className="space-y-5">
              <label className="text-sm text-gray-500 mb-1 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-[#EDEDED] p-3 rounded-lg"
              />
              <label className="text-sm text-gray-500 mb-1 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-[#EDEDED] p-3 rounded-lg"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account? <Link to="/">Sign Up</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;