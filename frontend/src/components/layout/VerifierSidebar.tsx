import { LayoutDashboard, ClipboardCheck, Flag, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const verifierNav = [
  { title: "Dashboard", url: "/verifier", icon: LayoutDashboard },
  { title: "Pending Items", url: "/verifier/pending", icon: ClipboardCheck },
  { title: "Reports", url: "/verifier/reports", icon: Flag },
  { title: "Flagged Items", url: "/verifier/flagged", icon: AlertTriangle },
];

const VerifierSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6">
        <Link to="/verifier" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">T</span>
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">TradeSwap</span>
          <span className="ml-1 text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded">Verifier</span>
        </Link>
      </div>
      <nav className="flex-1 px-3">
        {verifierNav.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-1",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default VerifierSidebar;
