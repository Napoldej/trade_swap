import { useState } from "react";
import { Upload, Info, Loader2 } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const CreateItem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ item_name: "", category_id: "", description: "" });
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");

  const isOther = form.category_id === "__other__";

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => categoriesService.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const createMutation = useMutation({
    mutationFn: itemsService.create,
    onSuccess: () => navigate("/my-items"),
    onError: (err) => {
      setError(err instanceof ApiException ? err.message : "Failed to create item.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category_id) { setError("Please select a category."); return; }

    let categoryId: number;

    if (isOther) {
      if (!customCategory.trim()) { setError("Please enter a category name."); return; }
      try {
        const newCat = await createCategoryMutation.mutateAsync(customCategory.trim());
        categoryId = newCat.category_id;
      } catch (err) {
        setError(err instanceof ApiException ? err.message : "Failed to create category.");
        return;
      }
    } else {
      categoryId = Number(form.category_id);
    }

    createMutation.mutate({ itemName: form.item_name, description: form.description, categoryId });
  };

  const isPending = createMutation.isPending || createCategoryMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold mb-2">List Your Item</h1>
        <p className="text-muted-foreground mb-8">Add details about the item you want to trade</p>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">{error}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Photos */}
          <div>
            <Label className="text-base font-semibold">Photos</Label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-8 text-center bg-background hover:border-primary/50 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Photo upload coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

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
              onValueChange={(v) => { setForm((f) => ({ ...f, category_id: v })); setCustomCategory(""); }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={catsLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</SelectItem>
                ))}
                <SelectItem value="__other__">Other (create new)</SelectItem>
              </SelectContent>
            </Select>

            {isOther && (
              <div className="mt-2">
                <Input
                  placeholder="Enter new category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">This will create a new category visible to all users.</p>
              </div>
            )}
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

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Your item will be reviewed by a verifier before it goes live on the marketplace.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
            disabled={isPending}
          >
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit for Verification"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;
