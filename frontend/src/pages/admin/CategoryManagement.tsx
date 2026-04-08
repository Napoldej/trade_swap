import { useState } from "react";
import { Plus, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { ApiException } from "@/lib/api";

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpenId, setEditOpenId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: () => categoriesService.create(newName),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setNewName(""); setAddOpen(false); },
    onError: (err) => setError(err instanceof ApiException ? err.message : "Failed to create."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoriesService.update(id, name),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setEditOpenId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div>
                <Label htmlFor="catName">Category Name</Label>
                <Input id="catName" placeholder="Enter category name" className="mt-1" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={() => createMutation.mutate()} disabled={!newName.trim() || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="bg-background rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.category_id}>
                    <TableCell className="font-mono text-sm">{c.category_id}</TableCell>
                    <TableCell className="font-medium">{c.category_name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={editOpenId === c.category_id} onOpenChange={(open) => { setEditOpenId(open ? c.category_id : null); if (open) setEditName(c.category_name); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                            <div>
                              <Label>Category Name</Label>
                              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditOpenId(null)}>Cancel</Button>
                              <Button className="gradient-primary text-primary-foreground border-0" onClick={() => updateMutation.mutate({ id: c.category_id, name: editName })} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                <span className="flex items-center gap-2 text-warning mb-2"><AlertTriangle className="h-4 w-4" /> This may affect items in this category.</span>
                                Are you sure you want to delete "{c.category_name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate(c.category_id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
