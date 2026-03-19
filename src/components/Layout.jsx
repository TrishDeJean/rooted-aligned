import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import AddScheduleDialog from "./schedule/AddScheduleDialog";

const navItems = [
  { path: "/Dashboard", icon: LayoutDashboard, label: "Today" },
  { path: "/Schedule", icon: CalendarDays, label: "Schedule" },
  { path: "/Kids", icon: Users, label: "Kids" },
];

export default function Layout() {
  const location = useLocation();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">N</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">NannyDay</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-3xl mx-auto flex items-center justify-around h-16 px-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || 
              (path === "/Dashboard" && location.pathname === "/");
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AddScheduleDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}