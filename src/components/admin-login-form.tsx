"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/app/admin/login/actions";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await adminLogin(username, password);
    if (result.ok) {
      const from = searchParams.get("from") || "/admin";
      router.push(from);
      router.refresh();
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm"
    >
      <h1 className="mb-1 text-xl font-bold">Admin sign in</h1>
      <p className="mb-6 text-sm text-black/50">AutoParts Hub back office</p>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Username</label>
        <input
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-black/20 px-3 py-2"
        />
      </div>
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-black/20 px-3 py-2"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
