import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { verifierService } from "@/services/verifier.service";
import { Badge } from "@/components/ui/badge";

const VerifierSidebar = () => {
  const location = useLocation();

  const { data: pendingTrades = [] } = useQuery({
    queryKey: ["verifier-pending-trades"],
    queryFn: verifierService.getPendingTrades,
    refetchInterval: 30000,
  });

  const navItems = [
    { title: "Pending Items", url: "/verifier/pending", icon: ClipboardCheck },
    { title: "Trade Verifications", url: "/verifier/trades", icon: ShieldCheck, count: pendingTrades.length },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6">
        <Link to="/verifier/pending" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">T</span>
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">TradeSwap</span>
          <span className="ml-1 text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded">Verifier</span>
        </Link>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const active = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
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
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.title}</span>
              {item.count != null && item.count > 0 && (
                <Badge className="gradient-primary text-primary-foreground border-0 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                  {item.count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default VerifierSidebar;
