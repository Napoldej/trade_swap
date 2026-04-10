import { ArrowLeftRight, MessageCircle, Flag, Check, Clock, Loader2 } from "lucide-react";
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

const STEPS = ["Proposed", "Accepted", "Confirming", "Completed"];

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
  const iAmReceiver = trade.receiver?.user?.user_name === user?.user_name;

  const iConfirmed = iAmProposer ? trade.proposer_confirmed : trade.receiver_confirmed;
  const otherConfirmed = iAmProposer ? trade.receiver_confirmed : trade.proposer_confirmed;
  const anyConfirmed = trade.proposer_confirmed || trade.receiver_confirmed;

  // Stepper logic: 0=Proposed, 1=Accepted, 2=Confirming, 3=Completed
  let currentStep = 0;
  if (trade.status === "ACCEPTED") {
    currentStep = anyConfirmed ? 2 : 1;
  } else if (trade.status === "COMPLETED") {
    currentStep = 3;
  } else if (trade.status === "PENDING") {
    currentStep = 0;
  }

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

        {/* 4-step Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i < currentStep ? "gradient-primary text-primary-foreground" :
                  i === currentStep ? "gradient-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-2 ${i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}>{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-16 h-0.5 mx-2 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
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
        <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start mb-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3">Proposer's Item</p>
              <Link to={`/item/${trade.proposer_item?.item_id}`}>
                <img src={trade.proposer_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={trade.proposer_item?.item_name} className="w-full aspect-[4/3] rounded-lg object-cover mb-3 hover:opacity-90 transition-opacity cursor-pointer" />
              </Link>
              <h3 className="font-semibold">{trade.proposer_item?.item_name ?? "Unknown"}</h3>
              <Link to={`/profile/${trade.proposer?.trader_id}`} className="flex items-center gap-2 mt-3 hover:opacity-80 transition-opacity w-fit">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{proposerName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-sm">{proposerName}</span>
              </Link>
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
              <Link to={`/item/${trade.receiver_item?.item_id}`}>
                <img src={trade.receiver_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={trade.receiver_item?.item_name} className="w-full aspect-[4/3] rounded-lg object-cover mb-3 hover:opacity-90 transition-opacity cursor-pointer" />
              </Link>
              <h3 className="font-semibold">{trade.receiver_item?.item_name ?? "Unknown"}</h3>
              <Link to={`/profile/${trade.receiver?.trader_id}`} className="flex items-center gap-2 mt-3 hover:opacity-80 transition-opacity w-fit">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-info text-info-foreground text-xs">{receiverName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-sm">{receiverName}</span>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Status (ACCEPTED only) */}
        {trade.status === "ACCEPTED" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { name: proposerName, confirmed: trade.proposer_confirmed, label: "Proposer" },
              { name: receiverName, confirmed: trade.receiver_confirmed, label: "Receiver" },
            ].map(({ name, confirmed, label }) => (
              <Card key={label} className={confirmed ? "border-success/40 bg-success/5" : "border-muted"}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${confirmed ? "bg-success/20" : "bg-muted"}`}>
                    {confirmed ? <Check className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{name}</p>
                    <p className={`text-xs mt-0.5 ${confirmed ? "text-success" : "text-muted-foreground"}`}>
                      {confirmed ? "Confirmed ✓" : "Pending..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alert banner when other person confirmed but you haven't */}
        {trade.status === "ACCEPTED" && otherConfirmed && !iConfirmed && (iAmProposer || iAmReceiver) && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-800 mb-6">
            Your trade partner has confirmed! Please confirm to complete the trade.
          </div>
        )}

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
        <div className="flex gap-3 flex-wrap items-center">
          {trade.status === "ACCEPTED" && (iAmProposer || iAmReceiver) && (
            iConfirmed ? (
              <Button disabled className="bg-success/10 text-success border border-success/20">
                <Check className="h-4 w-4 mr-2" /> You Confirmed
              </Button>
            ) : (
              <Button
                className={`text-primary-foreground border-0 hover:opacity-90 ${otherConfirmed ? "bg-orange-500 hover:bg-orange-600" : "gradient-primary"}`}
                onClick={() => completeMutation.mutate(trade.trade_id)}
                disabled={completeMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {otherConfirmed ? "Confirm to Complete!" : "Complete Trade"}
              </Button>
            )
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
