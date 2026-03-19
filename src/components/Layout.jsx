import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Plus, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddScheduleDialog from "./schedule/AddScheduleDialog";

const navItems = [
  { path: "/Dashboard", icon: LayoutDashboard, label: "Today" },
  { path: "/Schedule", icon: CalendarDays, label: "Schedule" },
  { path: "/Kids", icon: Users, label: "Kids" },
  { path: "/Profile", icon: UserCircle, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">R</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Rooted & Aligned</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:bg-primary/70 transition-colors shadow-sm select-none"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Page Content with transitions */}
      <main
        className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 overflow-y-auto"
        style={{ paddingBottom: `calc(5rem + env(safe-area-inset-bottom))` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50 select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-around h-16 px-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path ||
              (path === "/Dashboard" && location.pathname === "/");
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-95",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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