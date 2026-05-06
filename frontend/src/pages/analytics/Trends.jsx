import Navbar from "../../components/Navbar";
import UnderConstruction from "../../components/UnderConstruction";

export default function Trends() {
  return (
    <div>
      <Navbar />
      <UnderConstruction
        title="Analytics — Trends"
        description="Line graphs showing coverage performance over time. Compare monthly and quarterly data across programs."
        target="July 2026"
      />
    </div>
  );
}