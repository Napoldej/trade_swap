import { ArrowLeftRight, MessageCircle, Flag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradesService } from "@/services/trades.service";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const STEPS = ["PENDING", "ACCEPTED", "COMPLETED"];

const TradeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trade, isLoading, isError } = useQuery({
    queryKey: ["trade", id],
    queryFn: () => tradesService.getById(Number(id)),
    enabled: Boolean(id),
  });

  const completeMutation = useMutation({
    mutationFn: tradesService.complete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trade", id] }),
  });

  if (isLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </div>
  );

  if (isError || !trade) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Trade not found.</div>
    </div>
  );

  const iAmProposer = trade.proposer?.user?.user_name === user?.user_name;
  const currentStep = STEPS.indexOf(trade.status);

  const proposerName = trade.proposer?.user
    ? [trade.proposer.user.first_name, trade.proposer.user.last_name].filter(Boolean).join(" ") || trade.proposer.user.user_name
    : "Proposer";
  const receiverName = trade.receiver?.user
    ? [trade.receiver.user.first_name, trade.receiver.user.last_name].filter(Boolean).join(" ") || trade.receiver.user.user_name
    : "Receiver";

  const timeline: { label: string; date: string }[] = [
    { label: "Proposed", date: format(new Date(trade.created_at), "MMM d, yyyy h:mm a") },
    ...(trade.status !== "PENDING" ? [{ label: trade.status === "REJECTED" || trade.status === "CANCELLED" ? trade.status : "Accepted", date: format(new Date(trade.updated_at), "MMM d, yyyy h:mm a") }] : []),
    ...(trade.completed_at ? [{ label: "Completed", date: format(new Date(trade.completed_at), "MMM d, yyyy h:mm a") }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6">Trade Details</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {["Proposed", "Accepted", "Completed"].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${i <= currentStep ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-2 ${i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}>{step}</span>
              </div>
              {i < 2 && <div className={`w-24 h-0.5 mx-2 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Status badge for non-standard statuses */}
        {(trade.status === "REJECTED" || trade.status === "CANCELLED") && (
          <div className="flex justify-center mb-6">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-sm px-4 py-1">{trade.status}</Badge>
          </div>
        )}

        {/* Items */}
        <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start mb-8">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3">Proposer's Item</p>
              <img src={trade.proposer_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={trade.proposer_item?.item_name} className="w-full aspect-[4/3] rounded-lg object-cover mb-3" />
              <h3 className="font-semibold">{trade.proposer_item?.item_name ?? "Unknown"}</h3>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{proposerName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-sm">{proposerName}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center md:mt-20">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3">Receiver's Item</p>
              <img src={trade.receiver_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={trade.receiver_item?.item_name} className="w-full aspect-[4/3] rounded-lg object-cover mb-3" />
              <h3 className="font-semibold">{trade.receiver_item?.item_name ?? "Unknown"}</h3>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-info text-info-foreground text-xs">{receiverName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-sm">{receiverName}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Trade Timeline</p>
            <div className="space-y-3">
              {timeline.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">{e.label}</span>
                  <span className="text-muted-foreground">{e.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {trade.status === "ACCEPTED" && (
            <Button
              className="gradient-primary text-primary-foreground border-0 hover:opacity-90"
              onClick={() => completeMutation.mutate(trade.trade_id)}
              disabled={completeMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" /> Complete Trade
            </Button>
          )}
          {(trade.status === "ACCEPTED" || trade.status === "PENDING") && (
            <Link to={`/chat?trade=${trade.trade_id}`}>
              <Button variant="outline"><MessageCircle className="h-4 w-4 mr-2" /> Open Chat</Button>
            </Link>
          )}
          {trade.status === "COMPLETED" && (
            <Link to={`/rate-trade/${trade.trade_id}`}>
              <Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90">Rate This Trade</Button>
            </Link>
          )}
          <button className="text-sm text-muted-foreground hover:text-destructive ml-auto flex items-center gap-1">
            <Flag className="h-3.5 w-3.5" /> Report Trade
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
