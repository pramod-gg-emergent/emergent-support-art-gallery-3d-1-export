import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  return String(detail);
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      navigate("/admin");
    } catch (err) {
      setError(formatDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6" data-testid="admin-login-page">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md border border-white/10 bg-[#0a0a0a] p-10"
        data-testid="admin-login-form"
      >
        <p className="font-code mb-3 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
          Restricted
        </p>
        <h1 className="font-display mb-8 text-3xl font-black tracking-tighter text-white">
          STUDIO ACCESS
        </h1>
        {error && (
          <p className="font-code mb-6 border border-[#FF003C]/40 bg-[#FF003C]/10 px-4 py-3 text-xs text-[#FF003C]" data-testid="admin-login-error">
            {error}
          </p>
        )}
        <label className="font-code mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition-colors duration-300 focus:border-[#00F0FF]"
          data-testid="admin-email-input"
        />
        <label className="font-code mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-8 w-full border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition-colors duration-300 focus:border-[#00F0FF]"
          data-testid="admin-password-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="font-code w-full border border-[#00F0FF] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] transition-colors duration-300 hover:bg-[#00F0FF] hover:text-black disabled:opacity-40"
          data-testid="admin-login-submit"
        >
          {loading ? "Entering..." : "Enter Studio"}
        </button>
        <a href="/" className="font-code mt-6 block text-center text-[10px] uppercase tracking-[0.25em] text-white/40 transition-colors duration-300 hover:text-white">
          Back to site
        </a>
      </motion.form>
    </div>
  );
}
