"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/shared/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

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
        <div className="md:hidden text-lg font-bold text-gradient">Tracker</div>
        <SearchBar className="hidden md:block w-full max-w-md" />
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
              <>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
