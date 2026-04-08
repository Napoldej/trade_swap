import { Users, Package, ArrowLeftRight, CheckCircle, TrendingUp, UserCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

const COLORS = [
  "hsl(162, 72%, 40%)",
  "hsl(200, 60%, 50%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 50%, 55%)",
];

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminService.getAnalytics,
  });

  const stats = analytics
    ? [
        { label: "Total Users", value: analytics.total_users, icon: Users },
        { label: "Total Traders", value: analytics.total_traders, icon: UserCheck },
        { label: "Total Verifiers", value: analytics.total_verifiers, icon: CheckCircle },
        { label: "Total Items", value: analytics.total_items, icon: Package },
        { label: "Total Trades", value: analytics.total_trades, icon: ArrowLeftRight },
        { label: "Completed Trades", value: analytics.trades_by_status?.COMPLETED ?? 0, icon: TrendingUp },
      ]
    : [];

  const pieData = analytics?.trades_by_status
    ? Object.entries(analytics.trades_by_status).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-muted/20">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {stats.map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pieData.length > 0 && (
              <Card className="max-w-md">
                <CardHeader><CardTitle className="text-base">Trades by Status</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
