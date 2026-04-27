import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Shield, Flag, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImage, setCurrentImage] = useState(0);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: () => itemsService.getById(Number(id)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Item not found.</div>
      </div>
    );
  }

  const images = item.photos && item.photos.length > 0
    ? item.photos.map((p) => p.photo_url)
    : ["/placeholder.svg"];

  const owner = item.trader;
  const ownerName = owner?.user
    ? [owner.user.first_name, owner.user.last_name].filter(Boolean).join(" ") || owner.user.user_name
    : "Unknown";
  const ownerInitials = ownerName.slice(0, 2).toUpperCase();

  const s = item.user_trade_status ?? "available";
  const count = item.incoming_proposals_count ?? 0;
  const isOwn = s === "own_item" || s === "own_item_has_proposals" || s === "own_item_in_trade";

  const renderAction = () => {
    if (s === "own_item_in_trade") {
      return (
        <Link to="/my-trades">
          <Button size="lg" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
            View Trade
          </Button>
        </Link>
      );
    }
    if (s === "own_item_has_proposals") {
      return (
        <div className="space-y-2">
          <Link to="/my-trades">
            <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
              View Proposals ({count})
            </Button>
          </Link>
          <Link to={`/my-items`}>
            <Button size="lg" variant="outline" className="w-full">
              <Pencil className="h-4 w-4 mr-2" /> Edit Item
            </Button>
          </Link>
        </div>
      );
    }
    if (s === "own_item") {
      return (
        <Link to="/my-items">
          <Button size="lg" variant="outline" className="w-full">
            <Pencil className="h-4 w-4 mr-2" /> Manage Item
          </Button>
        </Link>
      );
    }
    if (s === "in_trade") {
      return (
        <Button size="lg" className="w-full bg-destructive/10 text-destructive border border-destructive/20" disabled>
          In Trade
        </Button>
      );
    }
    if (s === "offered_to_you") {
      return (
        <Link to="/my-trades">
          <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
            View Proposal (Offered to You)
          </Button>
        </Link>
      );
    }
    if (s === "user_pending") {
      return (
        <Button size="lg" className="w-full bg-warning/10 text-warning border border-warning/30" disabled>
          Your Trade Pending
        </Button>
      );
    }
    // available
    return (
      <Link to={`/propose-trade?item=${item.item_id}`}>
        <Button size="lg" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
          Propose Trade
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{item.item_name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
              <img src={images[currentImage]} alt={item.item_name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setCurrentImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-20 h-16 rounded-lg overflow-hidden border-2 ${i === currentImage ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{item.item_name}</h1>
            <div className="flex gap-2 mb-4 flex-wrap">
              {item.category && <Badge variant="secondary">{item.category.category_name}</Badge>}
              {item.status === "APPROVED" && (
                <Badge className="bg-success/10 text-success border-success/20"><Shield className="h-3 w-3 mr-1" />Approved</Badge>
              )}
              {item.status === "PENDING" && (
                <Badge className="bg-warning/10 text-warning border-warning/20">Pending Review</Badge>
              )}
              {item.status === "REJECTED" && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>
              )}
              {s === "offered_to_you" && (
                <Badge className="bg-orange-500 text-white">Offered to You</Badge>
              )}
              {s === "user_pending" && (
                <Badge className="bg-warning/90 text-warning-foreground">Your Trade Pending</Badge>
              )}
              {(s === "in_trade" || s === "own_item_in_trade") && (
                <Badge className="bg-destructive/80 text-white">In Trade</Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>

            {/* Owner Card */}
            {owner && (
              <Card className="mb-6">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">{ownerInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{ownerName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(owner.rating) ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                      </div>
                      <span className="ml-1">{owner.rating.toFixed(1)}</span>
                      <span>· {owner.total_trades} trades</span>
                    </div>
                  </div>
                  <Link to={`/profile/${owner.trader_id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {renderAction()}

            {!isOwn && (
              <button className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 mx-auto mt-3">
                <Flag className="h-3.5 w-3.5" /> Report Item
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemDetail;
