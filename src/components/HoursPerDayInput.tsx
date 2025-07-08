
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

export function HoursPerDayInput() {
  const { hoursPerDay, setHoursPerDay } = useAppState();

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Clock className="h-5 w-5" />
          Hours Per Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs">
          <Label htmlFor="hours" className="text-blue-700 dark:text-blue-300">How many hours per day do you play?</Label>
          <Input
            id="hours"
            type="number"
            min="1"
            max="24"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="bg-white dark:bg-slate-800"
          />
        </div>
      </CardContent>
    </Card>
  );
}
