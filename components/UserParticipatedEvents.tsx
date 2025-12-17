"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Gift, ChevronRight } from "lucide-react";

export interface UserEvent {
  _id: string;
  name: string;
  giftLimit: number;
  giftDate?: string;
  matchName: string | null;
  matchDate?: string;
}

interface UserParticipatedEventsProps {
  events: UserEvent[];
  selectedEvent: UserEvent | null;
  onSelectEvent: (event: UserEvent) => void;
}

export function UserParticipatedEvents({
  events,
  selectedEvent,
  onSelectEvent,
}: UserParticipatedEventsProps) {
  return (
    <Card className="border-white/10 shadow-white/5 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-white" />
          Çekilişlerim
        </CardTitle>
        <CardDescription>Katıldığınız etkinlikler</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 && (
          <p className="text-sm text-white/50">
            Henüz bir etkinliğe katılmadınız.
          </p>
        )}
        {events.map((event) => (
          <div
            key={event._id}
            className={`p-3 rounded border cursor-pointer transition-colors flex justify-between items-center ${selectedEvent?._id === event._id
                ? "bg-white/10 border-white/30"
                : "bg-black/20 border-white/10 hover:bg-white/5"
              }`}
            onClick={() => onSelectEvent(event)}
          >
            <span className="font-medium text-white">{event.name}</span>
            <ChevronRight className="w-4 h-4 text-white/50" />
          </div>

        ))}
      </CardContent>
    </Card>
  );
}
