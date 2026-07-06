
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

export function HoursPerDayInput() {
  const { hoursPerDay, setHoursPerDay } = useAppState();

  return (
    <Card className="osrs-card">
      <CardHeader>
        <CardTitle className="osrs-title flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hours Per Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs">
          <Label htmlFor="hours" className="text-muted-foreground">How many hours per day do you play?</Label>
          <Input
            id="hours"
            type="number"
            min="1"
            max="24"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="pixel-input w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
