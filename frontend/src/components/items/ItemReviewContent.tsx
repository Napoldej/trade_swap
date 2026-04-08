import { Check, X, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verifierService } from "@/services/verifier.service";
import { TraderItem } from "@/types/api";
import { format } from "date-fns";

const statusBadge = (status: string) => {
  if (status === "PENDING") return <Badge className="bg-warning/10 text-warning border-warning/20">PENDING</Badge>;
  if (status === "APPROVED") return <Badge className="bg-success/10 text-success border-success/20">APPROVED</Badge>;
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20">REJECTED</Badge>;
};

const ItemRow = ({
  item,
  reviewBasePath,
  onApprove,
  onReject,
  onRemove,
  approving,
  rejecting,
}: {
  item: TraderItem;
  reviewBasePath: string;
  onApprove?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
  approving?: boolean;
  rejecting?: boolean;
}) => (
  <div className="flex items-center gap-4 border rounded-xl p-4 bg-background">
    <img
      src={item.photos?.[0]?.photo_url ?? "/placeholder.svg"}
      alt={item.item_name}
      className="w-14 h-14 rounded-lg object-cover"
    />
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm">{item.item_name}</h3>
      <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
        {item.category && <span>{item.category.category_name}</span>}
        <span>· {format(new Date(item.created_at), "MMM d, yyyy")}</span>
        {item.trader?.user && <span>· by @{item.trader.user.user_name}</span>}
      </div>
      {item.rejection_reason && (
        <p className="text-xs text-destructive mt-1">Reason: {item.rejection_reason}</p>
      )}
    </div>
    {statusBadge(item.status)}
    <div className="flex gap-2">
      {onApprove && (
        <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={onApprove} disabled={approving}>
          <Check className="h-3.5 w-3.5 mr-1" />Approve
        </Button>
      )}
      {onReject && (
        <Button size="sm" variant="destructive" onClick={onReject} disabled={rejecting}>
          <X className="h-3.5 w-3.5 mr-1" />Reject
        </Button>
      )}
      {onRemove && (
        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
        </Button>
      )}
      <Link to={`${reviewBasePath}/${item.item_id}`}>
        <Button size="sm" className="gradient-primary text-primary-foreground border-0">Review</Button>
      </Link>
    </div>
  </div>
);

interface ItemReviewContentProps {
  reviewBasePath: string;
}

const ItemReviewContent = ({ reviewBasePath }: ItemReviewContentProps) => {
  const queryClient = useQueryClient();

  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["verifier-items", "PENDING"],
    queryFn: verifierService.getPendingItems,
  });

  const { data: approvedItems = [], isLoading: approvedLoading } = useQuery({
    queryKey: ["verifier-items", "APPROVED"],
    queryFn: verifierService.getApprovedItems,
  });

  const { data: rejectedItems = [], isLoading: rejectedLoading } = useQuery({
    queryKey: ["verifier-items", "REJECTED"],
    queryFn: verifierService.getRejectedItems,
  });

  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: ["verifier-items"] });

  const approveMutation = useMutation({ mutationFn: verifierService.approveItem, onSuccess: invalidateAll });
  const rejectMutation = useMutation({
    mutationFn: (id: number) => verifierService.rejectItem(id, "Does not meet listing requirements"),
    onSuccess: invalidateAll,
  });
  const removeMutation = useMutation({ mutationFn: verifierService.removeItem, onSuccess: invalidateAll });

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-bold mt-1 text-warning">{pendingItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold mt-1 text-success">{approvedItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-3xl font-bold mt-1 text-destructive">{rejectedItems.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1.5">
            Pending
            {pendingItems.length > 0 && (
              <Badge className="gradient-primary text-primary-foreground border-0 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedItems.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : pendingItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No pending items.</p>
          ) : (
            pendingItems.map((item) => (
              <ItemRow
                key={item.item_id}
                item={item}
                reviewBasePath={reviewBasePath}
                onApprove={() => approveMutation.mutate(item.item_id)}
                onReject={() => rejectMutation.mutate(item.item_id)}
                approving={approveMutation.isPending}
                rejecting={rejectMutation.isPending}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          {approvedLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : approvedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No approved items.</p>
          ) : (
            approvedItems.map((item) => (
              <ItemRow
                key={item.item_id}
                item={item}
                reviewBasePath={reviewBasePath}
                onRemove={() => removeMutation.mutate(item.item_id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejectedLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : rejectedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No rejected items.</p>
          ) : (
            rejectedItems.map((item) => (
              <ItemRow
                key={item.item_id}
                item={item}
                reviewBasePath={reviewBasePath}
                onApprove={() => approveMutation.mutate(item.item_id)}
                onRemove={() => removeMutation.mutate(item.item_id)}
                approving={approveMutation.isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ItemReviewContent;
