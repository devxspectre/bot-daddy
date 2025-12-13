"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const isSent = searchParams.get("sent") === "true";
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(isSent ? "Verification code sent to your email." : "");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/v1/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setSuccess("Email verified! Redirecting to signin...");
      setTimeout(() => router.push("/signin"), 2000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await fetch("http://localhost:3001/api/v1/user/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code");
      } else {
        setSuccess("New verification code sent!");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setResending(false);
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">No email provided</p>
        <Link href="/signup" className="text-primary hover:underline">
          Go to signup
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Check your email
        </h1>
        <p className="text-muted-foreground mt-2">
          We sent a verification code to
        </p>
        <p className="text-primary font-medium">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Enter 6-digit code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-lg">
            {success}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 py-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify Email <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-2 mx-auto"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Resend code
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Go back
        </Link>
      </div>
    </>
  );
}

export default function Verify() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
