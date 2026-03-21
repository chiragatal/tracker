"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/shared/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Topbar() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, [supabase]);

  const initials = email
    ? email.substring(0, 2).toUpperCase()
    : null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-b-transparent bg-card/80 backdrop-blur-sm" style={{ borderImage: "linear-gradient(to right, rgba(16,185,129,0.2), rgba(139,92,246,0.2), transparent) 1" }}>
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="md:hidden flex items-center gap-2">
          <img src="/logo.svg" alt="Tracker" className="h-7 w-7" />
          <span className="text-lg font-bold text-gradient">Tracker</span>
        </div>
        <SearchBar className="hidden md:block w-full max-w-md" />
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full hover:bg-muted p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-600 to-teal-600">
              <AvatarFallback className="bg-transparent text-white text-xs font-medium">
                {initials ?? <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {email && (
              <div className="px-2 py-1.5 border-b border-border mb-1">
                <p className="text-sm font-medium truncate">{email}</p>
              </div>
            )}
            <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/about")} className="cursor-pointer">
              <HelpCircle className="h-4 w-4 mr-2" />
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
