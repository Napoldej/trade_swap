import { useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import { tradesService } from "@/services/trades.service";
import { TraderItem } from "@/types/api";
import { ApiException } from "@/lib/api";

const ProposeTrade = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiverItemId = Number(searchParams.get("item"));

  const [selectedMyItemId, setSelectedMyItemId] = useState<string>("");
  const [error, setError] = useState("");

  // Their item (from query param)
  const { data: theirItem, isLoading: theirLoading } = useQuery({
    queryKey: ["item", receiverItemId],
    queryFn: () => itemsService.getById(receiverItemId),
    enabled: Boolean(receiverItemId),
  });

  // My approved & available items
  const { data: allMyItems = [], isLoading: myLoading } = useQuery({
    queryKey: ["my-items"],
    queryFn: itemsService.getMyItems,
  });
  const myItems = allMyItems.filter((i) => i.status === "APPROVED" && i.is_available);

  const selectedItem: TraderItem | undefined = myItems.find((i) => String(i.item_id) === selectedMyItemId);

  const proposeMutation = useMutation({
    mutationFn: tradesService.create,
    onSuccess: (trade) => navigate(`/trade/${trade.trade_id}`),
    onError: (err) => setError(err instanceof ApiException ? err.message : "Failed to propose trade."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedMyItemId) { setError("Please select your item."); return; }
    if (!theirItem) return;
    proposeMutation.mutate({
      proposerItemId: Number(selectedMyItemId),
      receiverId: theirItem.trader_id,
      receiverItemId: theirItem.item_id,
    });
  };

  if (theirLoading || myLoading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-2">Propose a Trade</h1>
        <p className="text-muted-foreground mb-8">Select your item to trade</p>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
            {/* Your Item */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Your Item</h3>
                {myItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved items available. <Link to="/create-item" className="text-primary hover:underline">List one first.</Link></p>
                ) : (
                  <>
                    <Select value={selectedMyItemId} onValueChange={setSelectedMyItemId}>
                      <SelectTrigger><SelectValue placeholder="Select your item" /></SelectTrigger>
                      <SelectContent>
                        {myItems.map((item) => (
                          <SelectItem key={item.item_id} value={String(item.item_id)}>{item.item_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedItem && (
                      <>
                        <div className="mt-4 rounded-xl overflow-hidden bg-muted aspect-[4/3]">
                          <img src={selectedItem.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={selectedItem.item_name} className="w-full h-full object-cover" />
                        </div>
                        <p className="font-medium mt-3">{selectedItem.item_name}</p>
                        {selectedItem.category && <p className="text-sm text-muted-foreground">{selectedItem.category.category_name}</p>}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Swap Icon */}
            <div className="flex items-center justify-center md:mt-24">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            {/* Their Item */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Their Item</h3>
                {theirItem ? (
                  <>
                    <div className="rounded-xl overflow-hidden bg-muted aspect-[4/3]">
                      <img src={theirItem.photos?.[0]?.photo_url ?? "/placeholder.svg"} alt={theirItem.item_name} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-medium mt-3">{theirItem.item_name}</p>
                    {theirItem.category && <p className="text-sm text-muted-foreground">{theirItem.category.category_name}</p>}
                    {theirItem.trader?.user && <p className="text-sm text-muted-foreground mt-1">Owner: {theirItem.trader.user.user_name}</p>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Item not found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mt-8">
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground border-0 hover:opacity-90" size="lg" disabled={proposeMutation.isPending}>
              {proposeMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Send Trade Proposal"}
            </Button>
            <Link to="/browse" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposeTrade;
