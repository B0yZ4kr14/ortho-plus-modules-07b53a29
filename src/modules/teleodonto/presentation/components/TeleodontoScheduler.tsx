import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function TeleodontoScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
              <div
                key={time}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <p className="font-medium">{time}</p>
                <p className="text-sm text-muted-foreground">Disponível</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
