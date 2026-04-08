import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiException } from "@/lib/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ user_name, password });
      navigate("/browse");
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TradeSwap</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue trading</p>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                className="mt-1"
                value={user_name}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Log In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 gradient-auth items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <Repeat className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Trade Without Money</h2>
          <p className="text-lg opacity-80 max-w-sm">Swap items you no longer need for things you've always wanted.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
