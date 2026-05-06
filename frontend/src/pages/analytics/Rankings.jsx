import Navbar from "../../components/Navbar";
import UnderConstruction from "../../components/UnderConstruction";

export default function Rankings() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Analytics — Rankings"
        description="LGU ranking by coverage rate. See top and bottom performers per program and period."
        target="June 2026"
      />
    </div>
  );
}