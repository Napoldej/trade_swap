import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, SkipForward, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import { verifierService } from "@/services/verifier.service";
import { ApiException } from "@/lib/api";

const CHECKLIST = [
  "Photo matches description",
  "Clear title and description",
  "Appropriate category",
  "No prohibited items",
  "Real photos (not stock)",
];

const VerifyItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentImage, setCurrentImage] = useState(0);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [checked, setChecked] = useState<boolean[]>(new Array(CHECKLIST.length).fill(false));
  const [error, setError] = useState("");

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => itemsService.getById(Number(id)),
    enabled: Boolean(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => verifierService.approveItem(Number(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["verifier-pending"] }); navigate("/verifier"); },
    onError: (err) => setError(err instanceof ApiException ? err.message : "Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => verifierService.rejectItem(Number(id), rejectionReason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["verifier-pending"] }); navigate("/verifier"); },
    onError: (err) => setError(err instanceof ApiException ? err.message : "Failed to reject."),
  });

  const handleReject = () => {
    if (!rejectionReason.trim()) { setError("Rejection reason is required."); return; }
    setError("");
    rejectMutation.mutate();
  };

  if (isLoading) return (
    <div className="flex min-h-screen"><VerifierSidebar />
      <div className="flex-1 flex flex-col"><Navbar roleBadge="Verifier" />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    </div>
  );

  if (!item) return (
    <div className="flex min-h-screen"><VerifierSidebar />
      <div className="flex-1 flex flex-col"><Navbar roleBadge="Verifier" />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Item not found.</div>
      </div>
    </div>
  );

  const images = item.photos && item.photos.length > 0 ? item.photos.map((p) => p.photo_url) : ["/placeholder.svg"];
  const traderName = item.trader?.user ? (item.trader.user.user_name) : "Unknown";
  const traderInitials = traderName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/verifier" className="text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="text-2xl font-bold">Review Item</h1>
          </div>

          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">{error}</div>}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
                <img src={images[currentImage]} alt={item.item_name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={() => setCurrentImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center"><ChevronRight className="h-5 w-5" /></button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${i === currentImage ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <h2 className="text-xl font-bold mb-2">{item.item_name}</h2>
              <div className="flex gap-2 mb-4">
                {item.category && <Badge variant="secondary">{item.category.category_name}</Badge>}
                <Badge variant="outline">PENDING</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{item.description}</p>

              <Card className="mb-6">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{traderInitials}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-sm">{traderName}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">{item.trader?.rating?.toFixed(1) ?? "0.0"} · {item.trader?.total_trades ?? 0} trades</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist */}
              <div className="space-y-3 mb-6">
                <p className="font-semibold text-sm">Verification Checklist</p>
                {CHECKLIST.map((c, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={checked[i]} onCheckedChange={(v) => { const n = [...checked]; n[i] = !!v; setChecked(n); }} />
                    {c}
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" />Approve</>}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowReject(!showReject)}>
                  <X className="h-4 w-4 mr-2" />Reject
                </Button>
                <Link to="/verifier"><Button variant="outline"><SkipForward className="h-4 w-4 mr-2" />Skip</Button></Link>
              </div>

              {showReject && (
                <div className="mt-4">
                  <Textarea placeholder="Rejection reason (required)..." className="mb-3" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                  <Button variant="destructive" className="w-full" onClick={handleReject} disabled={rejectMutation.isPending}>
                    {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyItem;
