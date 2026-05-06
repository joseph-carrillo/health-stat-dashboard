import Navbar from "../components/Navbar";
import UnderConstruction from "../components/UnderConstruction";

export default function Targets() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Program Targets"
        description="View and manage official program targets per indicator. Compare accomplishments against set targets."
        target="July 2026"
      />
    </div>
  );
}