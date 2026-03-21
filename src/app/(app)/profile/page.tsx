"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesThisMonth, setEntriesThisMonth] = useState(0);
  const [trackerCount, setTrackerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
        setCreatedAt(user.created_at);
      }

      const { count: total } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true });
      setTotalEntries(total ?? 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count: monthly } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());
      setEntriesThisMonth(monthly ?? 0);

      const { count: trackers } = await supabase
        .from("user_trackers")
        .select("*", { count: "exact", head: true });
      setTrackerCount(trackers ?? 0);

      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete all your entries and data. This cannot be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all user's entries (cascades to entry_images)
      await supabase.from("entries").delete().eq("user_id", user.id);
      // Delete all subscriptions
      await supabase.from("user_trackers").delete().eq("user_id", user.id);
      // Delete tracker types created by this user
      await supabase.from("tracker_types").delete().eq("created_by", user.id);

      toast.success("Account data deleted");
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account." />

      <div className="max-w-2xl space-y-6">
        {/* Account info */}
        <Card className="gradient-border">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gradient">Account</h2>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{email ?? "..."}</p>
            </div>
            {createdAt && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Member since</Label>
                <p className="text-sm font-medium">
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="gradient-border">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gradient">Stats</h2>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{entriesThisMonth}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{trackerCount}</p>
                  <p className="text-xs text-muted-foreground">Trackers</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="gradient-border">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gradient mb-4">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete account */}
        <Card className="border-destructive/50">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-destructive">
              Delete Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Permanently delete all your entries, tracker subscriptions, and
              tracker types. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
