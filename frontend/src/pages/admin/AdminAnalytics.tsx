import { Users, TrendingUp, Activity, Target, Star, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis = [
  { label: "Total Users", value: "2,451", icon: Users },
  { label: "New Users (30d)", value: "187", icon: TrendingUp },
  { label: "Active Traders", value: "1,340", icon: Activity },
  { label: "Trade Completion", value: "89.2%", icon: Target },
];

const registrationData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  users: Math.floor(Math.random() * 200) + 50,
}));

const tradeStatusData = [
  { name: "Completed", value: 2890, color: "hsl(142, 72%, 40%)" },
  { name: "Pending", value: 180, color: "hsl(45, 93%, 47%)" },
  { name: "Accepted", value: 95, color: "hsl(210, 92%, 55%)" },
  { name: "Rejected", value: 30, color: "hsl(0, 84%, 60%)" },
  { name: "Cancelled", value: 15, color: "hsl(215, 16%, 47%)" },
];

const topCategories = [
  { name: "Electronics", trades: 890 },
  { name: "Books", trades: 650 },
  { name: "Fashion", trades: 520 },
  { name: "Sports", trades: 380 },
  { name: "Home", trades: 290 },
];

const topTraders = [
  { name: "Alice Johnson", rating: 4.9, trades: 45 },
  { name: "Bob Smith", rating: 4.8, trades: 38 },
  { name: "Charlie Brown", rating: 4.7, trades: 32 },
  { name: "Diana Prince", rating: 4.6, trades: 28 },
  { name: "Eve Wilson", rating: 4.5, trades: 25 },
];

const AdminAnalytics = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <Select defaultValue="30">
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{k.label}</span>
                </div>
                <p className="text-3xl font-bold">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-base">New Registrations</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(162, 72%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Trade Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={tradeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {tradeStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">{c.name}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${(c.trades / 890) * 100}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{c.trades}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" />Top Traders</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Trades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTraders.map((t, i) => (
                    <TableRow key={t.name}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6"><AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{t.name.slice(0, 2)}</AvatarFallback></Avatar>
                          {t.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {t.rating}
                        </div>
                      </TableCell>
                      <TableCell>{t.trades}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
