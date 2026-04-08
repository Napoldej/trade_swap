import { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { ApiException } from "@/lib/api";

const EditProfile = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users-me"],
    queryFn: () => usersService.getMe(),
  });

  const profile = data?.data;

  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        email: profile.email ?? "",
      });
    }
  }, [profile]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg("");
    setSaveErr("");
    setSaving(true);
    try {
      await usersService.updateMe({
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        email: form.email || undefined,
      });
      setSaveMsg("Profile updated successfully.");
    } catch (err) {
      setSaveErr(err instanceof ApiException ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.user_name
    : "";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90"
                    title="Photo upload not yet supported"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">@{profile?.user_name}</p>
                </div>
              </div>

              {saveMsg && (
                <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-2 text-sm text-success mb-4">
                  {saveMsg}
                </div>
              )}
              {saveErr && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive mb-4">
                  {saveErr}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" className="mt-1" value={form.first_name} onChange={set("first_name")} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="mt-1" value={form.last_name} onChange={set("last_name")} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={profile?.user_name ?? ""} disabled className="mt-1 bg-muted" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1" value={form.email} onChange={set("email")} />
                </div>
                <Button
                  type="submit"
                  className="gradient-primary text-primary-foreground border-0 hover:opacity-90"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Password change is not yet available.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
