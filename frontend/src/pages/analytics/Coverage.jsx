import Navbar from "../../components/Navbar";
import UnderConstruction from "../../components/UnderConstruction";

export default function Coverage() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Analytics — Coverage"
        description="Bar charts and tables showing numerator, denominator, and coverage percentage per LGU and program."
        target="June 2026"
      />
    </div>
  );
}