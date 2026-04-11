import { Search, MoreHorizontal, Loader2, Check, X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { User } from "@/types/api";
import { format } from "date-fns";

const roleStyles: Record<string, string> = {
  TRADER: "bg-info/10 text-info",
  VERIFIER: "bg-primary/10 text-primary",
  ADMIN: "bg-destructive/10 text-destructive",
};

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", role: "" });
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminService.getUsers,
  });

  const { data: pendingVerifiers = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-verifiers"],
    queryFn: adminService.getPendingVerifiers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { first_name?: string; last_name?: string; role?: string } }) =>
      adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteUserId(null);
    },
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

  const verifyMutation = useMutation({
    mutationFn: adminService.verifyUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const unverifyMutation = useMutation({
    mutationFn: adminService.unverifyUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const filtered = users.filter((u) =>
    u.user_name.toLowerCase().includes(search.toLowerCase()) ||
    [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ first_name: u.first_name ?? "", last_name: u.last_name ?? "", role: u.role });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    updateMutation.mutate({
      id: editUser.user_id,
      data: {
        first_name: editForm.first_name || undefined,
        last_name: editForm.last_name || undefined,
        role: editForm.role || undefined,
      },
    });
  };

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
                                <DropdownMenuItem onClick={() => openEdit(u)}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" />Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => u.verified ? unverifyMutation.mutate(u.user_id) : verifyMutation.mutate(u.user_id)}
                                >
                                  {u.verified ? "Remove Verified" : "Verify User"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteUserId(u.user_id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />Delete User
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

      {/* ── Edit User Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={editForm.first_name}
                onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={editForm.last_name}
                onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRADER">TRADER</SelectItem>
                  <SelectItem value="VERIFIER">VERIFIER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────── */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteUserId !== null && deleteMutation.mutate(deleteUserId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
