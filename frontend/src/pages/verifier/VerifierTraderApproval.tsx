import { Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verifierService } from "@/services/verifier.service";
import { format } from "date-fns";

const VerifierTraderApproval = () => {
  const queryClient = useQueryClient();

  const { data: traders = [], isLoading } = useQuery({
    queryKey: ["verifier-pending-traders"],
    queryFn: verifierService.getPendingTraders,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: verifierService.approveTrader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["verifier-pending-traders"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: verifierService.rejectTrader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["verifier-pending-traders"] }),
  });

  return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-2">Pending Traders</h1>
          <p className="text-muted-foreground mb-6">Review and approve new trader account registrations.</p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : traders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pending trader applications.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {traders.map((u) => {
                const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.user_name;
                return (
                  <Card key={u.user_id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-info/10 text-info text-sm">
                          {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{displayName}</p>
                        <p className="text-sm text-muted-foreground">@{u.user_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Registered {format(new Date(u.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => approveMutation.mutate(u.user_id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(u.user_id)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />Reject
                        </Button>
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

export default VerifierTraderApproval;
