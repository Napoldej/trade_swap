import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import AdminSidebar from "@/components/layout/AdminSidebar";

const announcements = [
  { id: 1, title: "New Trading Categories!", content: "We've added Automotive and Music categories. Check them out and start trading!", status: "active", date: "Mar 25, 2025", author: "Admin" },
  { id: 2, title: "Platform Maintenance", content: "Scheduled maintenance on April 1st from 2-4 AM UTC.", status: "active", date: "Mar 20, 2025", author: "Admin" },
  { id: 3, title: "Welcome to TradeSwap", content: "Our platform is now live! Start listing your items and trade with the community.", status: "inactive", date: "Jan 1, 2025", author: "Admin" },
];

const AnnouncementManagement = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Create Announcement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Announcement title" className="mt-1" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea placeholder="Write your announcement..." className="mt-1 min-h-[120px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Save as Draft</Button>
                <Button className="gradient-primary text-primary-foreground border-0">Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="border rounded-xl p-5 bg-background">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                </div>
                <Badge className={a.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                  {a.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">{a.date} · by {a.author}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm">
                    {a.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManagement;
