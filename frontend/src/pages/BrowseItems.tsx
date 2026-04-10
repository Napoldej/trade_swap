import { useState } from "react";
import { Search, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import { categoriesService } from "@/services/categories.service";
import { TraderItem } from "@/types/api";

const ItemCard = ({ item }: { item: TraderItem }) => {
  const owner = item.trader?.user;
  const ownerName = owner
    ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.user_name
    : "Unknown";
  const rating = item.trader?.rating ?? 0;
  const s = item.user_trade_status ?? "available";
  const count = item.incoming_proposals_count ?? 0;
  const isOwn = s === "own_item" || s === "own_item_has_proposals" || s === "own_item_in_trade";

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow group relative ${isOwn ? "ring-2 ring-primary/30" : ""}`}>
      {/* Top-right badges */}
      {isOwn && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">Your Item</Badge>
          {s === "own_item_has_proposals" && (
            <Badge className="bg-orange-500 text-white text-[10px] px-2 py-0.5">
              {count} Proposal{count !== 1 ? "s" : ""}
            </Badge>
          )}
          {s === "own_item_in_trade" && (
            <Badge className="bg-destructive/80 text-white text-[10px] px-2 py-0.5">In Trade</Badge>
          )}
        </div>
      )}
      {s === "offered_to_you" && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-orange-500 text-white text-[10px] px-2 py-0.5">Offered to You</Badge>
        </div>
      )}
      {s === "user_pending" && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-warning/90 text-warning-foreground text-[10px] px-2 py-0.5">Your Trade Pending</Badge>
        </div>
      )}
      {s === "in_trade" && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-destructive/80 text-white text-[10px] px-2 py-0.5">In Trade</Badge>
        </div>
      )}

      <Link to={`/item/${item.item_id}`}>
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={item.photos?.[0]?.photo_url ?? "/placeholder.svg"}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/item/${item.item_id}`}>
          <h3 className="font-semibold mb-1 hover:text-primary transition-colors">{item.item_name}</h3>
        </Link>
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {item.category && (
            <Badge variant="secondary" className="text-xs">{item.category.category_name}</Badge>
          )}
          <Badge className="bg-success/10 text-success border border-success/20 text-xs">Approved</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Link to={`/profile/${item.trader?.trader_id}`} className="hover:text-primary hover:underline transition-colors">
            {ownerName}
          </Link>
          <Star className="h-3 w-3 fill-warning text-warning ml-1" />
          <span>{rating.toFixed(1)}</span>
        </div>

        {/* Action button based on user_trade_status */}
        {s === "own_item_has_proposals" ? (
          <Link to="/my-trades">
            <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
              View Proposals ({count})
            </Button>
          </Link>
        ) : s === "own_item_in_trade" ? (
          <Link to="/my-trades">
            <Button size="sm" className="w-full" variant="outline">View Trade</Button>
          </Link>
        ) : isOwn ? (
          <Link to="/my-items">
            <Button size="sm" className="w-full" variant="outline">Manage Item</Button>
          </Link>
        ) : s === "in_trade" ? (
          <Button size="sm" className="w-full bg-destructive/10 text-destructive border border-destructive/20" disabled>
            In Trade
          </Button>
        ) : s === "offered_to_you" ? (
          <Link to="/my-trades">
            <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
              View Proposal
            </Button>
          </Link>
        ) : s === "user_pending" ? (
          <Button size="sm" className="w-full bg-warning/10 text-warning border border-warning/30" disabled>
            Your Trade Pending
          </Button>
        ) : (
          <Link to={`/propose-trade?item=${item.item_id}`}>
            <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
              Propose Trade
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

const BrowseItems = () => {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: itemsService.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  });

  const filtered = items.filter((item) => {
    const matchSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryId === "all" || String(item.category_id) === categoryId;
    return matchSearch && matchCat;
  });

  const myItems = filtered.filter((i) =>
    i.user_trade_status === "own_item" ||
    i.user_trade_status === "own_item_has_proposals" ||
    i.user_trade_status === "own_item_in_trade"
  );
  const otherItems = filtered.filter((i) =>
    i.user_trade_status !== "own_item" &&
    i.user_trade_status !== "own_item_has_proposals" &&
    i.user_trade_status !== "own_item_in_trade"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No items found.</div>
        ) : (
          <>
            {myItems.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">Your Listed Items</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myItems.map((item) => <ItemCard key={item.item_id} item={item} />)}
                </div>
              </section>
            )}

            {otherItems.length > 0 && (
              <section>
                {myItems.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-medium text-muted-foreground">Available to Trade</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {otherItems.map((item) => <ItemCard key={item.item_id} item={item} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrowseItems;
