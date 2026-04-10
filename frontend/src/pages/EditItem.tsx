import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { itemsService } from "@/services/items.service";
import { ApiException } from "@/lib/api";

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ item_name: "", category_id: "", description: "" });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["my-item", id],
    queryFn: () => itemsService.getById(Number(id)),
    enabled: !!id,
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  });

  // Pre-fill form once item data is loaded
  useEffect(() => {
    if (item && !ready) {
      setForm({
        item_name: item.item_name,
        category_id: String(item.category_id),
        description: item.description,
      });
      setReady(true);
    }
  }, [item, ready]);

  const updateMutation = useMutation({
    mutationFn: (dto: { itemName?: string; categoryId?: number; description?: string }) =>
      itemsService.update(Number(id), dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["my-item", id] });
      navigate("/my-items");
    },
    onError: (err) => {
      setError(err instanceof ApiException ? err.message : "Failed to update item.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category_id) { setError("Please select a category."); return; }

    updateMutation.mutate({
      itemName: form.item_name,
      categoryId: Number(form.category_id),
      description: form.description,
    });
  };

  if (itemLoading || catsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-1 text-muted-foreground">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold mb-2">Edit Item</h1>
        <p className="text-muted-foreground mb-8">Update your item details. It will go back to pending review after editing.</p>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">{error}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Current photos preview (read-only) */}
          {item.photos && item.photos.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Current Photos</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {item.photos.map((photo) => (
                  <div key={photo.photo_id} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img src={photo.photo_url} alt="item photo" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g. Vintage Film Camera"
              className="mt-1"
              value={form.item_name}
              onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.category_id} value={String(c.category_id)}>
                    {c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="desc">Description</Label>
              <span className="text-xs text-muted-foreground">{form.description.length}/500</span>
            </div>
            <Textarea
              id="desc"
              placeholder="Describe your item in detail..."
              className="mt-1 min-h-[120px]"
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </div>

          <Alert className="border-warning/20 bg-warning/5">
            <Info className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm">
              Editing this item will reset its status to <strong>Pending</strong> and require re-verification.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/my-items")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground border-0 hover:opacity-90"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
