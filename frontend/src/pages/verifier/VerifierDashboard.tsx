import Navbar from "@/components/layout/Navbar";
import VerifierSidebar from "@/components/layout/VerifierSidebar";
import ItemReviewContent from "@/components/items/ItemReviewContent";

const VerifierDashboard = () => (
  <div className="flex min-h-screen">
    <VerifierSidebar />
    <div className="flex-1 flex flex-col">
      <Navbar roleBadge="Verifier" />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Verifier Dashboard</h1>
        <ItemReviewContent reviewBasePath="/verifier/review" />
      </div>
    </div>
  </div>
);

export default VerifierDashboard;
