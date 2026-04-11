import { Users, ShieldCheck, BarChart3, Store, LogOut, Package } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Pending Items", url: "/admin/items", icon: ShieldCheck },
  { title: "All Items", url: "/admin/manage-items", icon: Package },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">T</span>
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">TradeSwap</span>
          <span className="ml-1 text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {adminNav.map((item) => {
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

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-1">
        <Link
          to="/browse"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Store className="h-4 w-4" />
          Browse Items
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
