"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(
    errorParam === "invalid_token"
      ? "Login link expired or invalid. Please try again."
      : errorParam === "missing_token"
        ? "Missing login token."
        : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/career/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Login failed"); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="ml-[2px]" />
          <span className="font-bold text-foreground">GebetaMaps</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-6">Certificate portal administration</p>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-semibold text-foreground mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a login link to the admin email. Click it to access the portal. The link expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Send Login Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
