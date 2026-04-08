import { Search, MoreHorizontal, Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { format } from "date-fns";

const roleStyles: Record<string, string> = {
  TRADER: "bg-info/10 text-info",
  VERIFIER: "bg-primary/10 text-primary",
  ADMIN: "bg-destructive/10 text-destructive",
};

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminService.getUsers,
  });

  const { data: pendingVerifiers = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-verifiers"],
    queryFn: adminService.getPendingVerifiers,
  });

  const banMutation = useMutation({
    mutationFn: adminService.banUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const unbanMutation = useMutation({
    mutationFn: adminService.unbanUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveVerifier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifiers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectVerifier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-verifiers"] }),
  });

  const filtered = users.filter((u) =>
    u.user_name.toLowerCase().includes(search.toLowerCase()) ||
    [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending Verifiers
              {pendingVerifiers.length > 0 && (
                <Badge className="gradient-primary text-primary-foreground border-0 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                  {pendingVerifiers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── All Users ─────────────────────────────────────── */}
          <TabsContent value="users">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by username or name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="bg-background rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => {
                      const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.user_name;
                      const isBanned = !u.verified;
                      return (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                              <div>
                                <p className="font-medium text-sm">{displayName}</p>
                                <p className="text-xs text-muted-foreground">@{u.user_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge className={roleStyles[u.role] ?? ""}>{u.role}</Badge></TableCell>
                          <TableCell>
                            <Badge className={u.verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                              {u.verified ? "verified" : "unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(u.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => isBanned ? unbanMutation.mutate(u.user_id) : banMutation.mutate(u.user_id)}
                                >
                                  {isBanned ? "Unban User" : "Ban User"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── Pending Verifiers ─────────────────────────────── */}
          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : pendingVerifiers.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No pending verifier applications.</div>
            ) : (
              <div className="space-y-3">
                {pendingVerifiers.map((u) => {
                  const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.user_name;
                  return (
                    <Card key={u.user_id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{displayName}</p>
                          <p className="text-sm text-muted-foreground">@{u.user_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Applied {format(new Date(u.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => approveMutation.mutate(u.user_id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(u.user_id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagement;
