import React, { useState } from "react";
import bg from "../assets/bggggggg.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext.jsx";
import toast from "react-hot-toast";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      const user = await signup(
        form.name,
        form.email,
        form.password,
        form.company
      );

      toast.success("Account created successfully 🎉");

      if (user?.role === "superadmin") {
        navigate("/superadmin");
      } else if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Signup failed ❌";

      console.log("SIGNUP ERROR:", err);
      toast.error(msg);
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

            <h1 className="text-5xl font-bold -ml-1 mb-2">
              ClientFlow
            </h1>

            <p className="text-lg font-medium mb-2">
              Customer Relationship Management Platform
            </p>

            <p className="text-sm opacity-90 leading-relaxed max-w-sm">
              Manage customer relationships, track leads, and streamline your business operations from a single platform.
            </p>

          </div>
        </div>

        {/* Right form panel — full-width on mobile, half on desktop */}
        <div className="w-full md:w-1/2 flex items-center justify-center py-8">
          <div className="w-full max-w-md px-6">

            <h2 className="text-3xl font-bold text-[#2FA77A] text-center mb-8">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full bg-[#EDEDED] p-3 rounded-lg outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="mt-8 w-full py-3 rounded-full text-white font-semibold tracking-wide bg-gradient-to-r from-[#2FA77A] to-[#3BC08A] hover:opacity-90 transition"
              >
                SIGN UP
              </button>

            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2FA77A] font-semibold hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;