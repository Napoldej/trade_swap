import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseItems from "./pages/BrowseItems";
import ItemDetail from "./pages/ItemDetail";
import CreateItem from "./pages/CreateItem";
import MyItems from "./pages/MyItems";
import ProposeTrade from "./pages/ProposeTrade";
import MyTrades from "./pages/MyTrades";
import TradeDetail from "./pages/TradeDetail";
import Chat from "./pages/Chat";
import RateTrade from "./pages/RateTrade";
import TraderProfile from "./pages/TraderProfile";
import EditProfile from "./pages/EditProfile";
import EditItem from "./pages/EditItem";
import Notifications from "./pages/Notifications";
import VerifierDashboard from "./pages/verifier/VerifierDashboard";
import VerifyItem from "./pages/verifier/VerifyItem";
import VerifierReports from "./pages/verifier/VerifierReports";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminItemReview from "./pages/admin/AdminItemReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<BrowseItems />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/create-item" element={<CreateItem />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/propose-trade" element={<ProposeTrade />} />
          <Route path="/my-trades" element={<MyTrades />} />
          <Route path="/trade/:id" element={<TradeDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/rate-trade/:id" element={<RateTrade />} />
          <Route path="/profile/:id" element={<TraderProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/verifier" element={<VerifierDashboard />} />
          <Route path="/verifier/review/:id" element={<VerifyItem />} />
          <Route path="/verifier/reports" element={<VerifierReports />} />
          <Route path="/verifier/pending" element={<VerifierDashboard />} />
          <Route path="/verifier/flagged" element={<VerifierDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/items" element={<AdminItemReview />} />
          <Route path="/admin/reports" element={<VerifierReports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
