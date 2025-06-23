
import { Input } from "@/components/ui/input";

interface HoursPerDayInputProps {
  hoursPerDay: number;
  setHoursPerDay: (hours: number) => void;
}

export const HoursPerDayInput = ({ hoursPerDay, setHoursPerDay }: HoursPerDayInputProps) => {
  return (
    <div className="flex justify-center">
      <div className="pixel-card p-4">
        <div className="flex items-center gap-3">
          <label className="text-base font-semibold text-gray-900 font-mono">
            ⏰ Hours per day:
          </label>
          <Input
            type="number"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="pixel-input w-20 text-center font-mono font-bold"
            min="1"
            max="24"
          />
        </div>
      </div>
    </div>
  );
};
