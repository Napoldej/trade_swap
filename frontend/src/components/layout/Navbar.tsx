import { Bell, MessageCircle, Search, ChevronDown, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  roleBadge?: string;
}

const Navbar = ({ roleBadge }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.user_name ? user.user_name.slice(0, 2).toUpperCase() : "?";
  const profilePath = user?.trader_id ? `/profile/${user.trader_id}` : "/edit-profile";
  const isAdmin = user?.role === "ADMIN";
  const isVerifier = user?.role === "VERIFIER";
  const isTrader = user?.role === "TRADER";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TradeSwap</span>
            {(isAdmin || isVerifier) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {isAdmin ? "Admin" : "Verifier"}
              </Badge>
            )}
            {roleBadge && !isAdmin && !isVerifier && (
              <Badge variant="secondary" className="ml-1 text-xs">{roleBadge}</Badge>
            )}
          </Link>
        </div>

        {/* Search — only for traders */}
        {(isTrader || !user) && (
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-9" />
            </div>
          </div>
        )}

        <nav className="flex items-center gap-1">
          {/* ADMIN nav */}
          {isAdmin && (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />Dashboard
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">Users</Button>
              </Link>
              <Link to="/admin/categories">
                <Button variant="ghost" size="sm">Categories</Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="ghost" size="sm">Analytics</Button>
              </Link>
            </>
          )}

          {/* VERIFIER nav */}
          {isVerifier && (
            <>
              <Link to="/verifier">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ShieldCheck className="h-4 w-4" />Dashboard
                </Button>
              </Link>
              <Link to="/verifier/reports">
                <Button variant="ghost" size="sm">Reports</Button>
              </Link>
            </>
          )}

          {/* TRADER nav */}
          {(isTrader || !user) && (
            <>
              <Link to="/browse">
                <Button variant="ghost" size="sm">Browse</Button>
              </Link>
              <Link to="/my-items">
                <Button variant="ghost" size="sm">My Items</Button>
              </Link>
              <Link to="/my-trades">
                <Button variant="ghost" size="sm">My Trades</Button>
              </Link>
            </>
          )}

          {/* Notifications & chat — all roles */}
          {user && (
            <>
              <Link to="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              {isTrader && (
                <Link to="/chat">
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* User dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  @{user.user_name}
                  <span className="ml-1 font-medium text-foreground">{user.role}</span>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild><Link to="/admin">Admin Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/users">User Management</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/categories">Categories</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/admin/analytics">Analytics</Link></DropdownMenuItem>
                  </>
                )}
                {isVerifier && (
                  <>
                    <DropdownMenuItem asChild><Link to="/verifier">Verifier Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/verifier/reports">Reports</Link></DropdownMenuItem>
                  </>
                )}
                {isTrader && (
                  <>
                    <DropdownMenuItem asChild><Link to={profilePath}>My Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/my-items">My Items</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/my-trades">My Trades</Link></DropdownMenuItem>
                  </>
                )}
                {!isTrader && (
                  <DropdownMenuItem asChild><Link to="/edit-profile">Edit Profile</Link></DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-primary-foreground border-0">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
