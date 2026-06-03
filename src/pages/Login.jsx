import React, { useState } from "react";
import bg from "../assets/bggggggg.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext.jsx";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

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
      className="w-full bg-cover bg-center bg-no-repeat overflow-x-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        minHeight: "100dvh",          // ← dvh covers mobile browser chrome (address bar)
        backgroundColor: "#1a6b50",   // ← fallback color matching your bg image so no grey shows
      }}
    >
      <div className="flex w-full" style={{ minHeight: "100dvh" }}>

        {/* Left branding panel — hidden on mobile, unchanged on desktop */}
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

        {/* Right form panel — full-width on mobile, half on desktop */}
        <div className="w-full md:w-1/2 flex items-center justify-center py-8">
          <div className="w-full max-w-md px-6">

            <h2 className="text-3xl font-bold text-[#2FA77A] text-center mb-8">
Welcome back            </h2>

            <div className="space-y-5">

              {/* Email field */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Password field with eye toggle */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{" "}
              <Link to="/" className="text-[#2FA77A] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;