import { Users, TrendingUp, Activity, Target, Star, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:  "hsl(142, 72%, 40%)",
  PENDING:    "hsl(45, 93%, 47%)",
  ACCEPTED:   "hsl(210, 92%, 55%)",
  REJECTED:   "hsl(0, 84%, 60%)",
  CANCELLED:  "hsl(215, 16%, 47%)",
};

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminService.getAnalytics,
  });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const tradeStatusData = Object.entries(data.tradesByStatus).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value: value as number,
    color: STATUS_COLORS[name] ?? "hsl(215, 16%, 47%)",
  }));

  const maxItems = Math.max(...data.topCategories.map((c: any) => c.item_count), 1);

  const kpis = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), icon: Users },
    { label: "Total Traders", value: data.totalTraders.toLocaleString(), icon: TrendingUp },
    { label: "Total Items", value: data.totalItems.toLocaleString(), icon: Activity },
    { label: "Trade Completion", value: `${data.completionRate}%`, icon: Target },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>

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
            <CardHeader><CardTitle className="text-base">New Registrations (Last 12 months)</CardTitle></CardHeader>
            <CardContent>
              {data.registrationsByMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.registrationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Users" fill="hsl(162, 72%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Trade Status Distribution</CardTitle></CardHeader>
            <CardContent>
              {tradeStatusData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No trades yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tradeStatusData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {tradeStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Top Categories by Items</CardTitle></CardHeader>
            <CardContent>
              {data.topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No categories yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topCategories.map((c: any) => (
                    <div key={c.category_id} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-28 truncate">{c.name}</span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full"
                          style={{ width: `${(c.item_count / maxItems) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{c.item_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />Top Traders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topTraders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No traders yet.</p>
              ) : (
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
                    {data.topTraders.map((t: any, i: number) => (
                      <TableRow key={t.trader_id}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                {t.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{t.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {Number(t.rating).toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{t.total_trades}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
