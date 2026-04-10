import { Star, Shield, Flag, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tradersService } from "@/services/traders.service";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const StarRow = ({ score }: { score: number }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-4 w-4 ${s <= score ? "fill-warning text-warning" : "text-muted"}`} />
    ))}
  </div>
);

const TraderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const traderId = Number(id);
  const { user } = useAuth();

  const { data: trader, isLoading, isError } = useQuery({
    queryKey: ["trader", traderId],
    queryFn: () => tradersService.getProfile(traderId),
    enabled: !isNaN(traderId),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ["trader-ratings", traderId],
    queryFn: () => tradersService.getRatings(traderId),
    enabled: !isNaN(traderId),
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

  if (isError || !trader) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Trader not found.
        </div>
      </div>
    );
  }

  const displayName =
    trader.user.first_name && trader.user.last_name
      ? `${trader.user.first_name} ${trader.user.last_name}`
      : trader.user.user_name;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = trader.user.created_at
    ? format(new Date(trader.user.created_at), "MMM yyyy")
    : null;

  const approvedItems = (trader.items ?? []).filter((i) => i.status === "APPROVED" && i.is_available);
  const isOwnProfile = user && trader.user.user_id === user.user_id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {trader.user.verified && (
                <Badge className="bg-success/10 text-success border-success/20">
                  <Shield className="h-3 w-3 mr-1" />Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-2">@{trader.user.user_name}</p>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <StarRow score={Math.round(trader.rating)} />
                <span className="font-medium ml-1">{trader.rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span>{trader.total_trades} completed trade{trader.total_trades !== 1 ? "s" : ""}</span>
              {memberSince && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />Member since {memberSince}
                  </span>
                </>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <Link to="/edit-profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          )}
        </div>

        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Listed Items ({approvedItems.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({ratings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-4">
            {approvedItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No items listed yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedItems.map((item) => (
                  <Link to={`/item/${item.item_id}`} key={item.item_id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={item.photos?.[0]?.photo_url ?? "/placeholder.svg"}
                          alt={item.item_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium">{item.item_name}</h3>
                        {item.category && (
                          <Badge variant="secondary" className="text-xs mt-1">{item.category.category_name}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            {ratings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reviews yet.</p>
            ) : (
              ratings.map((r) => {
                const raterName = r.rater?.user?.user_name ?? `Trader #${r.rater_id}`;
                const raterInitials = raterName.slice(0, 2).toUpperCase();
                return (
                  <Card key={r.rating_id}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-xs">{raterInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{raterName}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(r.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex my-1">
                          <StarRow score={r.score} />
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {!isOwnProfile && (
          <div className="mt-8">
            <button className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" /> Report User
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TraderProfile;
