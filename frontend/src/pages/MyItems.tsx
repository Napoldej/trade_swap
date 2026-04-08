import { useState } from "react";
import { Plus, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

const MyItems = () => {
  const [tab, setTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-items"],
    queryFn: itemsService.getMyItems,
  });

  const deleteMutation = useMutation({
    mutationFn: itemsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-items"] }),
  });

  const filtered = tab === "all" ? items : items.filter((i) => i.status === tab.toUpperCase());
  const rejectedItems = filtered.filter((i) => i.status === "REJECTED" && i.rejection_reason);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Items</h1>
          <Link to="/create-item">
            <Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> List New Item
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                  <p className="text-muted-foreground mb-4">Start by listing your first item</p>
                  <Link to="/create-item">
                    <Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90">List your first item</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rejectedItems.map((item) => (
                    <Alert key={`rej-${item.item_id}`} className="border-destructive/20 bg-destructive/5">
                      <AlertDescription className="text-sm">
                        <strong>{item.item_name}</strong> was rejected: {item.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {filtered.map((item) => (
                    <div key={item.item_id} className="flex items-center gap-4 border rounded-xl p-4 bg-background hover:shadow-sm transition-shadow">
                      <img
                        src={item.photos?.[0]?.photo_url ?? "/placeholder.svg"}
                        alt={item.item_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <div className="flex gap-2 mt-1">
                          {item.category && <span className="text-xs text-muted-foreground">{item.category.category_name}</span>}
                        </div>
                      </div>
                      <Badge className={statusStyles[item.status]}>{item.status.toLowerCase()}</Badge>
                      <span className="text-sm text-muted-foreground hidden md:block">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(item.item_id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyItems;
