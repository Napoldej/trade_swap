import { useRef, useState } from "react";
import { Upload, X, Info, Loader2, ImagePlus } from "lucide-react";
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

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

const CreateItem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ item_name: "", category_id: "", description: "" });
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    const valid = incoming.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const combined = [...selectedFiles, ...valid].slice(0, MAX_FILES);
    setSelectedFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));

    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const files = selectedFiles.filter((_, i) => i !== index);
    const prevs = previews.filter((_, i) => i !== index);
    setSelectedFiles(files);
    setPreviews(prevs);
  };

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

    let item: Awaited<ReturnType<typeof itemsService.create>>;
    try {
      item = await createMutation.mutateAsync({
        itemName: form.item_name,
        description: form.description,
        categoryId,
      });
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Failed to create item.");
      return;
    }

    // Upload photos one by one
    if (selectedFiles.length > 0) {
      setUploadingPhotos(true);
      try {
        for (let i = 0; i < selectedFiles.length; i++) {
          await itemsService.uploadPhoto(item.item_id, selectedFiles[i], i);
        }
      } catch (err) {
        // Item was created — navigate anyway, photos partially uploaded
        setError(err instanceof ApiException ? `Item created but some photos failed: ${err.message}` : "Item created but photo upload failed.");
        queryClient.invalidateQueries({ queryKey: ["my-items"] });
        navigate("/my-items");
        return;
      } finally {
        setUploadingPhotos(false);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["my-items"] });
    navigate("/my-items");
  };

  const isPending = createMutation.isPending || createCategoryMutation.isPending || uploadingPhotos;

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
            <Label className="text-base font-semibold">
              Photos <span className="text-muted-foreground font-normal text-sm">(up to {MAX_FILES})</span>
            </Label>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img src={src} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previews.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Add more</span>
                  </button>
                )}
              </div>
            )}

            {/* Drop zone — shown when no files yet */}
            {previews.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full border-2 border-dashed rounded-xl p-8 text-center bg-background hover:border-primary/50 transition-colors"
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to select photos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to {MAX_SIZE_MB}MB each</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
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
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadingPhotos ? "Uploading photos…" : "Submitting…"}
              </>
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;
