import { useState } from "react";
import { ArrowLeftRight, Check, X, MessageCircle, Star as StarIcon, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradesService } from "@/services/trades.service";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  ACCEPTED: "bg-info/10 text-info border-info/20",
  AWAITING_VERIFICATION: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  AWAITING_VERIFICATION: "Awaiting Verification",
};

const MyTrades = () => {
  const [tab, setTab] = useState("all");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["my-trades"],
    queryFn: tradesService.getMyTrades,
  });

  const acceptMutation = useMutation({ mutationFn: tradesService.accept, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-trades"] }) });
  const rejectMutation = useMutation({ mutationFn: tradesService.reject, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-trades"] }) });
  const cancelMutation = useMutation({ mutationFn: tradesService.cancel, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-trades"] }) });
  const completeMutation = useMutation({ mutationFn: tradesService.complete, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-trades"] }) });

  const filtered = tab === "all" ? trades : trades.filter((t) => t.status === tab.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">My Trades</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="awaiting_verification">Verifying</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trades here</h3>
                  <p className="text-muted-foreground">Browse items and propose your first trade!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((trade) => {
                    const iAmProposer = trade.proposer?.user?.user_name === user?.user_name;
                    const myItem = iAmProposer ? trade.proposer_item : trade.receiver_item;
                    const theirItem = iAmProposer ? trade.receiver_item : trade.proposer_item;
                    const otherUser = iAmProposer ? trade.receiver?.user?.user_name : trade.proposer?.user?.user_name;

                    return (
                      <div key={trade.trade_id} className="flex items-center gap-4 border rounded-xl p-4 bg-background hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2">
                          <img src={myItem?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={myItem?.item_name} className="w-14 h-14 rounded-lg object-cover" />
                          <ArrowLeftRight className="h-4 w-4 text-primary shrink-0" />
                          <img src={theirItem?.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={theirItem?.item_name} className="w-14 h-14 rounded-lg object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{myItem?.item_name ?? "?"} ↔ {theirItem?.item_name ?? "?"}</p>
                          <p className="text-xs text-muted-foreground">with {otherUser ?? "Unknown"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={statusStyles[trade.status]}>{statusLabels[trade.status] ?? trade.status.toLowerCase()}</Badge>
                          {trade.status === "ACCEPTED" && (() => {
                            const iConfirmed = iAmProposer ? trade.proposer_confirmed : trade.receiver_confirmed;
                            const otherConfirmed = iAmProposer ? trade.receiver_confirmed : trade.proposer_confirmed;
                            if (iConfirmed && !otherConfirmed) return <span className="text-[10px] text-muted-foreground">Waiting for other trader</span>;
                            if (!iConfirmed && otherConfirmed) return <span className="text-[10px] text-orange-500 font-medium">Partner confirmed!</span>;
                            return null;
                          })()}
                        </div>
                        <span className="text-sm text-muted-foreground hidden md:block">
                          {format(new Date(trade.created_at), "MMM d, yyyy")}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {trade.status === "PENDING" && !iAmProposer && (
                            <>
                              <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => acceptMutation.mutate(trade.trade_id)} disabled={acceptMutation.isPending}>
                                <Check className="h-3.5 w-3.5 mr-1" />Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => rejectMutation.mutate(trade.trade_id)} disabled={rejectMutation.isPending}>
                                <X className="h-3.5 w-3.5 mr-1" />Reject
                              </Button>
                            </>
                          )}
                          {trade.status === "PENDING" && iAmProposer && (
                            <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate(trade.trade_id)} disabled={cancelMutation.isPending}>Cancel</Button>
                          )}
                          {trade.status === "ACCEPTED" && (() => {
                            const iConfirmed = iAmProposer ? trade.proposer_confirmed : trade.receiver_confirmed;
                            const otherConfirmed = iAmProposer ? trade.receiver_confirmed : trade.proposer_confirmed;
                            return (
                              <>
                                {iConfirmed ? (
                                  <Button size="sm" disabled className="bg-success/10 text-success border border-success/20 text-xs">You Confirmed ✓</Button>
                                ) : (
                                  <Button size="sm" className={`text-primary-foreground border-0 ${otherConfirmed ? "bg-orange-500 hover:bg-orange-600" : "gradient-primary"}`} onClick={() => completeMutation.mutate(trade.trade_id)} disabled={completeMutation.isPending}>
                                    {otherConfirmed ? "Confirm!" : "Complete"}
                                  </Button>
                                )}
                                <Link to={`/chat?trade=${trade.trade_id}`}>
                                  <Button size="sm" variant="outline"><MessageCircle className="h-3.5 w-3.5 mr-1" />Chat</Button>
                                </Link>
                              </>
                            );
                          })()}
                          {trade.status === "COMPLETED" && (
                            <Link to={`/rate-trade/${trade.trade_id}`}>
                              <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                                <StarIcon className="h-3.5 w-3.5 mr-1" />Rate
                              </Button>
                            </Link>
                          )}
                          <Link to={`/trade/${trade.trade_id}`}>
                            <Button size="sm" variant="ghost">View</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyTrades;
