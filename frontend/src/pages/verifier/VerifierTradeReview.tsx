import { ArrowLeftRight, Loader2, Check, X, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { verifierService } from "@/services/verifier.service";
import { format } from "date-fns";

const VerifierTradeReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: trade, isLoading, isError } = useQuery({
    queryKey: ["verifier-trade", id],
    queryFn: () => verifierService.getTradeById(Number(id)),
    enabled: Boolean(id),
  });

  const confirmMutation = useMutation({
    mutationFn: () => verifierService.confirmTrade(Number(id), note || undefined),
    onSuccess: () => navigate("/verifier/trades"),
  });

  const rejectMutation = useMutation({
    mutationFn: () => verifierService.rejectTrade(Number(id), rejectReason),
    onSuccess: () => navigate("/verifier/trades"),
  });

  if (isLoading) return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  if (isError || !trade) return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Trade not found or not awaiting verification.</div>
      </div>
    </div>
  );

  const proposerName =
    [trade.proposer?.user?.first_name, trade.proposer?.user?.last_name].filter(Boolean).join(" ") ||
    trade.proposer?.user?.user_name || "Proposer";
  const receiverName =
    [trade.receiver?.user?.first_name, trade.receiver?.user?.last_name].filter(Boolean).join(" ") ||
    trade.receiver?.user?.user_name || "Receiver";

  return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/verifier/trades" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="text-2xl font-bold">Review Trade #{trade.trade_id}</h1>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">Awaiting Verification</Badge>
          </div>

          {/* Items */}
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start mb-6">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium mb-3">PROPOSER'S ITEM</p>
                {trade.proposer_item?.photos && trade.proposer_item.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {trade.proposer_item.photos.map((p) => (
                      <img key={p.photo_id} src={p.photo_url} alt={trade.proposer_item?.item_name} className="w-full aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-lg bg-muted mb-3" />
                )}
                <h3 className="font-semibold">{trade.proposer_item?.item_name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{trade.proposer_item?.category?.category_name}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{trade.proposer_item?.description}</p>
                <div className="flex items-center gap-2 mt-3 border-t pt-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{proposerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{proposerName}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">{trade.proposer?.rating?.toFixed(1) ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center md:mt-24">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium mb-3">RECEIVER'S ITEM</p>
                {trade.receiver_item?.photos && trade.receiver_item.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {trade.receiver_item.photos.map((p) => (
                      <img key={p.photo_id} src={p.photo_url} alt={trade.receiver_item?.item_name} className="w-full aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-lg bg-muted mb-3" />
                )}
                <h3 className="font-semibold">{trade.receiver_item?.item_name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{trade.receiver_item?.category?.category_name}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{trade.receiver_item?.description}</p>
                <div className="flex items-center gap-2 mt-3 border-t pt-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-info/10 text-info text-xs">{receiverName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{receiverName}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">{trade.receiver?.rating?.toFixed(1) ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Trade Timeline</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">Proposed</span>
                  <span className="text-muted-foreground">{format(new Date(trade.created_at), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">Accepted</span>
                  <span className="text-muted-foreground">{format(new Date(trade.updated_at), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-medium">Both Confirmed → Awaiting Verification</span>
                  <span className="text-muted-foreground">{format(new Date(trade.updated_at), "MMM d, yyyy h:mm a")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          {!showRejectForm ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Verification Note (optional)</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an optional note for this verification..."
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90 flex-1"
                  onClick={() => confirmMutation.mutate()}
                  disabled={confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Confirm Trade
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowRejectForm(true)}
                >
                  <X className="h-4 w-4 mr-2" />Reject Trade
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border border-destructive/20 rounded-lg p-4 bg-destructive/5">
              <p className="text-sm font-semibold text-destructive">Reject Trade Verification</p>
              <div className="space-y-1.5">
                <Label>Reason (required)</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this trade is being rejected..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowRejectForm(false)} className="flex-1">Cancel</Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => rejectMutation.mutate()}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierTradeReview;
