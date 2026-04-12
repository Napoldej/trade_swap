import { ArrowLeftRight, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifierService } from "@/services/verifier.service";
import { format } from "date-fns";

const VerifierTradeList = () => {
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["verifier-pending-trades"],
    queryFn: verifierService.getPendingTrades,
  });

  return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-2">Trade Verifications</h1>
          <p className="text-muted-foreground mb-6">Review trades where both parties have confirmed and approve or reject them.</p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-20">
              <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trades awaiting verification</h3>
              <p className="text-muted-foreground">All trades are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => {
                const proposerName =
                  [trade.proposer?.user?.first_name, trade.proposer?.user?.last_name].filter(Boolean).join(" ") ||
                  trade.proposer?.user?.user_name || "Proposer";
                const receiverName =
                  [trade.receiver?.user?.first_name, trade.receiver?.user?.last_name].filter(Boolean).join(" ") ||
                  trade.receiver?.user?.user_name || "Receiver";

                return (
                  <Card key={trade.trade_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Items */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <img
                              src={trade.proposer_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"}
                              alt={trade.proposer_item?.item_name}
                              className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />
                            <div className="text-center shrink-0">
                              <ArrowLeftRight className="h-5 w-5 text-primary mx-2" />
                            </div>
                            <img
                              src={trade.receiver_item?.photos?.[0]?.photo_url ?? "/placeholder.svg"}
                              alt={trade.receiver_item?.item_name}
                              className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {trade.proposer_item?.item_name} ↔ {trade.receiver_item?.item_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {proposerName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{proposerName}</span>
                              <span className="text-xs text-muted-foreground">↔</span>
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-info/10 text-info">
                                  {receiverName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{receiverName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">Awaiting Verification</Badge>
                          <p className="text-xs text-muted-foreground">
                            Both confirmed {format(new Date(trade.updated_at), "MMM d, yyyy")}
                          </p>
                          <Link to={`/verifier/trades/${trade.trade_id}`}>
                            <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />Review Trade
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierTradeList;
