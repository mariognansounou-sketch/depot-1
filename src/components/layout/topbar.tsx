import { Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";

export function Topbar({ userName, userEmail }: { userName?: string | null; userEmail?: string | null }) {
  const initials = (userName || userEmail || "U").slice(0, 1).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-xl">
      <div />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <div className="mx-2 h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium">{userName ?? "Mon compte"}</span>
            <span className="text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
