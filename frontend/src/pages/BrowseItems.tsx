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
import { useAuth } from "@/context/AuthContext";
import { TraderItem } from "@/types/api";

const statusConfig: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
  PENDING:  { label: "Pending",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
};

const ItemCard = ({ item, isOwn }: { item: TraderItem; isOwn: boolean }) => {
  const owner = item.trader?.user;
  const ownerName = owner
    ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.user_name
    : "Unknown";
  const rating = item.trader?.rating ?? 0;
  const status = statusConfig[item.status] ?? statusConfig.PENDING;

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow group relative ${isOwn ? "ring-2 ring-primary/30" : ""}`}>
      {/* Status badge — top-left */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${status.className}`}>
          {status.label}
        </Badge>
      </div>
      {isOwn && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">Your Item</Badge>
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
        {item.category && (
          <Badge variant="secondary" className="text-xs mb-2">{item.category.category_name}</Badge>
        )}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <span>{ownerName}</span>
          <Star className="h-3 w-3 fill-warning text-warning ml-1" />
          <span>{rating.toFixed(1)}</span>
        </div>
        {isOwn ? (
          <Link to="/my-items">
            <Button size="sm" className="w-full" variant="outline">Manage Item</Button>
          </Link>
        ) : item.status === "APPROVED" && item.is_available ? (
          <Link to={`/propose-trade?item=${item.item_id}`}>
            <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
              Propose Trade
            </Button>
          </Link>
        ) : (
          <Button size="sm" className="w-full" variant="outline" disabled>
            {item.status === "PENDING" ? "Awaiting Approval" : item.status === "REJECTED" ? "Rejected" : "Unavailable"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const BrowseItems = () => {
  const { user } = useAuth();
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

  // Determine ownership: compare trader_id if available, fall back to username
  const isOwnItem = (item: TraderItem) => {
    if (user?.trader_id != null) return user.trader_id === item.trader_id;
    if (user?.user_name) return user.user_name === item.trader?.user?.user_name;
    return false;
  };

  const myItems = filtered.filter(isOwnItem);
  const otherItems = filtered.filter((item) => !isOwnItem(item));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Filters */}
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
            {/* User's own items */}
            {myItems.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">Your Listed Items</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myItems.map((item) => <ItemCard key={item.item_id} item={item} isOwn={true} />)}
                </div>
              </section>
            )}

            {/* Other users' items */}
            {otherItems.length > 0 && (
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {otherItems.map((item) => <ItemCard key={item.item_id} item={item} isOwn={false} />)}
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
