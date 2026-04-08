import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Repeat, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiException } from "@/lib/api";

type Role = "TRADER" | "VERIFIER";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("TRADER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_name: "",
    password: "",
    confirm_password: "",
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(form.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-destructive", "bg-warning", "bg-primary/60", "bg-primary"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        user_name: form.user_name,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role,
      });

      if (result?.message) {
        // VERIFIER — show pending message
        setPendingMessage(result.message);
      } else {
        // TRADER — auto-logged in, go to browse
        navigate("/browse");
      }
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

  if (pendingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Account Submitted</h2>
          <p className="text-muted-foreground">{pendingMessage}</p>
          <Link to="/login">
            <Button variant="outline" className="mt-4">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TradeSwap</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground mb-6">Start swapping today</p>

          {/* Role tabs */}
          <div className="flex rounded-lg border p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => setRole("TRADER")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                role === "TRADER"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Trader
            </button>
            <button
              type="button"
              onClick={() => setRole("VERIFIER")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                role === "VERIFIER"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Verifier
            </button>
          </div>

          {role === "VERIFIER" && (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground mb-4">
              Verifier accounts require admin approval before you can log in.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" className="mt-1" value={form.first_name} onChange={set("first_name")} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" className="mt-1" value={form.last_name} onChange={set("last_name")} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-1" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="johndoe" className="mt-1" value={form.user_name} onChange={set("user_name")} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
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
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                value={form.confirm_password}
                onChange={set("confirm_password")}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Creating account…" : role === "VERIFIER" ? "Submit for Approval" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
          </p>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden lg:flex flex-1 gradient-auth items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <Repeat className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Join the Community</h2>
          <p className="text-lg opacity-80 max-w-sm">
            {role === "VERIFIER"
              ? "Help keep the marketplace safe by reviewing and approving listings."
              : "Connect with traders and swap items in a safe, verified marketplace."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
