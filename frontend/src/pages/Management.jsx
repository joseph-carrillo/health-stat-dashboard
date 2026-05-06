import Navbar from "../components/Navbar";
import UnderConstruction from "../components/UnderConstruction";

export default function Management() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Management"
        description="User management, role assignment, data uploads, and system administration. Admin access only."
        target="June 2026"
      />
    </div>
  );
}