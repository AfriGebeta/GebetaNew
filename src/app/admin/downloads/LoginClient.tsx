"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3 } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/downloads/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) router.refresh();
      else setError((await res.json().catch(() => ({}))).error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <h1 className="font-bold text-foreground">Download stats</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Enter the stats password to continue.</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <Button type="submit" className="w-full mt-4" disabled={loading || !password}>
          {loading ? "Checking…" : "Login"}
        </Button>
      </form>
    </div>
  );
}
