"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <Card className="gradient-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          {sent
            ? "Check your email for the reset link"
            : "Enter your email and we'll send you a reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
            <p className="text-sm text-muted-foreground text-center">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              Check your inbox and click the link to reset your password.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
