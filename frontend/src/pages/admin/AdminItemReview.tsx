import AdminSidebar from "@/components/layout/AdminSidebar";
import ItemReviewContent from "@/components/items/ItemReviewContent";

const AdminItemReview = () => (
  <div className="flex min-h-screen">
    <AdminSidebar />
    <div className="flex-1 p-6 bg-muted/20">
      <h1 className="text-3xl font-bold mb-6">Item Review</h1>
      <ItemReviewContent reviewBasePath="/verifier/review" />
    </div>
  </div>
);

export default AdminItemReview;
