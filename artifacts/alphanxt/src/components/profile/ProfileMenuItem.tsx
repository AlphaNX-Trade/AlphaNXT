import { ChevronRight, type LucideIcon } from "lucide-react";

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Red/danger styling — used for destructive actions like Logout */
  destructive?: boolean;
}

/**
 * Single tappable row inside a profile settings list.
 * Reused for Edit Profile, Settings, Notifications, Help, and Logout.
 */
export function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: ProfileMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
      data-testid={`profile-menu-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          destructive ? "bg-red-500/10" : "bg-primary/10"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${destructive ? "text-red-400" : "text-primary"}`}
        />
      </div>
      <span
        className={`flex-1 text-left text-sm font-medium ${
          destructive ? "text-red-400" : "text-foreground"
        }`}
      >
        {label}
      </span>
      {!destructive && (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}
