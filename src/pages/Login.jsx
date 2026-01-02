import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";
import logo from "/img/logo-2.png"; // 🔁 change to your logo path

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // IMPORTANT for httpOnly refresh token
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // 🔐 Keep existing logic
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🌟 Beautiful success message
      await Swal.fire({
        title: "Welcome Back 🎉",
        text: "You have successfully signed in",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "Enter Dashboard",
        timer: 2000,
        timerProgressBar: true,
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Card */}
      <div className="relative w-[380px] rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="h-14 drop-shadow-lg"
          />
        </div>

        <h2 className="text-center text-2xl font-semibold text-white mb-1">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-300 mb-6">
          Sign in to continue
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-white cursor-pointer"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-emerald-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 text-slate-900 font-semibold py-2.5 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FiLogIn className="group-hover:translate-x-1 transition" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
