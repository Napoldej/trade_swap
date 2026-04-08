import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Shield, Flag, Loader2 } from "lucide-react";
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
              <Badge className="bg-success/10 text-success border-success/20"><Shield className="h-3 w-3 mr-1" />Approved</Badge>
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

            <Link to={`/propose-trade?item=${item.item_id}`}>
              <Button size="lg" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 mb-3">
                Propose Trade
              </Button>
            </Link>
            <button className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 mx-auto">
              <Flag className="h-3.5 w-3.5" /> Report Item
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemDetail;
