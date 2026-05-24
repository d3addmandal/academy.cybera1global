"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    fetch("/api/admin/auth/me", { credentials: "same-origin" }).then((r) => {
      if (r.ok) router.replace(`/webapplication/${company}/${adminSlug}/dashboard`);
    });
  }, [company, adminSlug, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, companySlug: company }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      const from = searchParams.get("from") || data.data.redirectTo;
      router.replace(from);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" suppressHydrationWarning>
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-900/8 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-[0_0_30px_rgba(224,0,0,0.35)]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            Admin <span className="text-red-500">Portal</span>
          </h1>
          <p className="text-slate-500 text-sm">Sign in to access the control panel</p>
        </div>

        {/* Login card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="username"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm pl-10 pr-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm pl-10 pr-11 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-800/50 rounded-xl p-3.5 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-3.5 rounded-xl hover:from-red-600 hover:to-red-500 hover:shadow-[0_8px_20px_rgba(224,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-5 select-none">
          Restricted access · Unauthorised entry is prohibited
        </p>
      </div>
    </div>
  );
}
