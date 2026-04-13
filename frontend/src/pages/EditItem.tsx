import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Info, X, ImagePlus } from "lucide-react";
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

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ item_name: "", category_id: "", description: "" });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    const existingCount = (item?.photos?.length ?? 0) - deletedPhotoIds.length;
    const valid = incoming
      .filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE_MB * 1024 * 1024)
      .slice(0, MAX_FILES - existingCount - newFiles.length);
    if (!valid.length) return;
    const combined = [...newFiles, ...valid];
    setNewFiles(combined);
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((f) => f.filter((_, i) => i !== index));
    setNewPreviews((p) => p.filter((_, i) => i !== index));
  };

  const toggleDeleteExisting = (photoId: number) => {
    setDeletedPhotoIds((ids) =>
      ids.includes(photoId) ? ids.filter((x) => x !== photoId) : [...ids, photoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category_id) { setError("Please select a category."); return; }

    try {
      await updateMutation.mutateAsync({
        itemName: form.item_name,
        categoryId: Number(form.category_id),
        description: form.description,
      });
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Failed to update item.");
      return;
    }

    // Delete removed photos
    for (const photoId of deletedPhotoIds) {
      try { await itemsService.deletePhoto(Number(id), photoId); } catch { /* ignore */ }
    }

    // Upload new photos
    if (newFiles.length > 0) {
      setUploadingPhotos(true);
      const existingKept = (item?.photos ?? []).filter((p) => !deletedPhotoIds.includes(p.photo_id)).length;
      try {
        for (let i = 0; i < newFiles.length; i++) {
          await itemsService.uploadPhoto(Number(id), newFiles[i], existingKept + i);
        }
      } catch (err) {
        setError(err instanceof ApiException ? `Saved but some photos failed: ${err.message}` : "Saved but photo upload failed.");
      } finally {
        setUploadingPhotos(false);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["my-items"] });
    queryClient.invalidateQueries({ queryKey: ["my-item", id] });
    navigate("/my-items");
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
          {/* Photos */}
          <div>
            <Label className="text-base font-semibold">
              Photos <span className="text-muted-foreground font-normal text-sm">(up to {MAX_FILES})</span>
            </Label>

            <div className="mt-2 grid grid-cols-4 gap-2">
              {/* Existing photos — click X to mark for deletion */}
              {item.photos?.map((photo) => {
                const markedForDelete = deletedPhotoIds.includes(photo.photo_id);
                return (
                  <div key={photo.photo_id} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={photo.photo_url}
                      alt="item photo"
                      className={`w-full h-full object-cover transition-opacity ${markedForDelete ? "opacity-30" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleDeleteExisting(photo.photo_id)}
                      className={`absolute top-1 right-1 rounded-full p-0.5 text-white ${markedForDelete ? "bg-muted-foreground/80 hover:bg-muted-foreground" : "bg-black/60 hover:bg-black/80"}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {markedForDelete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-destructive">Remove</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* New photo previews */}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={src} alt={`new ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add more button */}
              {(item.photos?.length ?? 0) - deletedPhotoIds.length + newFiles.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>

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
              disabled={updateMutation.isPending || uploadingPhotos}
            >
              {updateMutation.isPending || uploadingPhotos ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{uploadingPhotos ? "Uploading photos…" : "Saving…"}</>
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
