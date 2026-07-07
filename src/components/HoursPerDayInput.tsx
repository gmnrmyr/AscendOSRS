import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

// Linha compacta (não merece um card inteiro): "Hours played per day: [ 9 ]"
export function HoursPerDayInput() {
  const { hoursPerDay, setHoursPerDay } = useAppState();

  return (
    <div className="osrs-card flex items-center gap-3 px-4 py-2 w-fit">
      <Clock className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--gold))" }} />
      <label htmlFor="hours" className="osrs-label text-sm whitespace-nowrap">
        Hours played per day
      </label>
      <Input
        id="hours"
        type="number"
        min="1"
        max="24"
        value={hoursPerDay}
        onChange={(e) => setHoursPerDay(Number(e.target.value))}
        className="pixel-input w-20 text-center"
      />
    </div>
  );
}
