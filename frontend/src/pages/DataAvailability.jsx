import Navbar from "../components/Navbar";
import UnderConstruction from "../components/UnderConstruction";

export default function DataAvailability() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Data Availability"
        description="Track which LGUs have submitted data per program and reporting period. Identify missing submissions."
        target="July 2026"
      />
    </div>
  );
}