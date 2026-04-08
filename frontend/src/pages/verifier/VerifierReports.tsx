import { useState } from "react";
import { Flag, AlertTriangle, User, Package, Eye, Ban, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";

const reasonStyles: Record<string, string> = {
  "Fake Item": "bg-destructive/10 text-destructive",
  "Inappropriate": "bg-warning/10 text-warning",
  "Scam": "bg-destructive/10 text-destructive",
  "Spam": "bg-muted text-muted-foreground",
  "Other": "bg-muted text-muted-foreground",
};

const reports = [
  { id: 1, type: "item", target: "Suspicious Laptop", reporter: "Bob Smith", reason: "Fake Item", desc: "This item seems like a scam. Photos look like stock images.", date: "Mar 25, 2025", status: "pending" },
  { id: 2, type: "user", target: "ScamUser123", reporter: "Alice", reason: "Scam", desc: "This user never completed trades and seems fraudulent.", date: "Mar 24, 2025", status: "pending" },
  { id: 3, type: "item", target: "Counterfeit Watch", reporter: "Charlie", reason: "Fake Item", desc: "This is a counterfeit designer watch.", date: "Mar 23, 2025", status: "reviewing" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  reviewing: "bg-info/10 text-info border-info/20",
  resolved: "bg-success/10 text-success border-success/20",
  dismissed: "bg-muted text-muted-foreground",
};

const VerifierReports = () => {
  const [tab, setTab] = useState("pending");

  return (
    <div className="flex min-h-screen">
      <VerifierSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar roleBadge="Verifier" />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Reports</h1>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-3">
              {reports.filter((r) => r.status === tab).map((report) => (
                <Card key={report.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {report.type === "item" ? <Package className="h-5 w-5 text-muted-foreground" /> : <User className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{report.target}</p>
                        <Badge className={reasonStyles[report.reason]}>{report.reason}</Badge>
                        <Badge className={statusStyles[report.status]}>{report.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{report.desc}</p>
                      <p className="text-xs text-muted-foreground">Reported by {report.reporter} · {report.date}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">Review</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Report: {report.target}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Reason</p>
                            <Badge className={`${reasonStyles[report.reason]} mt-1`}>{report.reason}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Description</p>
                            <p className="text-sm text-muted-foreground">{report.desc}</p>
                          </div>
                          <Textarea placeholder="Resolution note..." />
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="destructive" size="sm"><X className="h-3.5 w-3.5 mr-1" />Remove Content</Button>
                            <Button className="bg-warning text-warning-foreground hover:bg-warning/90" size="sm"><AlertCircle className="h-3.5 w-3.5 mr-1" />Warn User</Button>
                            <Button variant="destructive" size="sm"><Ban className="h-3.5 w-3.5 mr-1" />Ban User</Button>
                            <Button variant="outline" size="sm">Dismiss</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
              {reports.filter((r) => r.status === tab).length === 0 && (
                <p className="text-center text-muted-foreground py-10">No {tab} reports</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VerifierReports;
