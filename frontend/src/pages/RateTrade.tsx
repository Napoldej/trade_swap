import { useState } from "react";
import { Star, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tradesService } from "@/services/trades.service";
import { ratingsService } from "@/services/ratings.service";
import { useAuth } from "@/context/AuthContext";
import { ApiException } from "@/lib/api";

const RateTrade = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const { data: trade, isLoading } = useQuery({
    queryKey: ["trade", id],
    queryFn: () => tradesService.getById(Number(id)),
    enabled: Boolean(id),
  });

  const rateMutation = useMutation({
    mutationFn: ratingsService.create,
    onSuccess: () => navigate("/my-trades"),
    onError: (err) => setError(err instanceof ApiException ? err.message : "Failed to submit rating."),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!trade) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">Trade not found.</div>
  );

  const iAmProposer = trade.proposer?.user?.user_name === user?.user_name;
  const ratee = iAmProposer ? trade.receiver : trade.proposer;
  const rateeTraderId = iAmProposer ? trade.receiver_id : trade.proposer_id;
  const rateeName = ratee?.user ? (ratee.user.user_name) : "Unknown";

  const myItem = iAmProposer ? trade.proposer_item : trade.receiver_item;
  const theirItem = iAmProposer ? trade.receiver_item : trade.proposer_item;

  const handleSubmit = () => {
    if (score === 0) { setError("Please select a rating."); return; }
    setError("");
    rateMutation.mutate({ tradeId: trade.trade_id, rateeId: rateeTraderId, score, comment: comment || undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Rate Your Trade Experience</h2>

        {/* Trade Summary */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <img src={myItem?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={myItem?.item_name} className="w-16 h-16 rounded-lg object-cover mx-auto" />
            <p className="text-xs text-muted-foreground mt-1">Your item</p>
          </div>
          <ArrowLeftRight className="h-5 w-5 text-primary shrink-0" />
          <div className="text-center">
            <img src={theirItem?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={theirItem?.item_name} className="w-16 h-16 rounded-lg object-cover mx-auto" />
            <p className="text-xs text-muted-foreground mt-1">Their item</p>
          </div>
        </div>

        {/* Trader */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{rateeName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{rateeName}</span>
        </div>

        {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setScore(s)} className="transition-transform hover:scale-110">
              <Star className={`h-10 w-10 ${s <= (hover || score) ? "fill-warning text-warning" : "text-muted"}`} />
            </button>
          ))}
        </div>

        <Textarea placeholder="Share your experience (optional)" className="mb-6" value={comment} onChange={(e) => setComment(e.target.value)} />

        <Button className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 mb-3" onClick={handleSubmit} disabled={rateMutation.isPending}>
          {rateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit Rating"}
        </Button>
        <button className="w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate("/my-trades")}>Skip</button>
      </div>
    </div>
  );
};

export default RateTrade;
