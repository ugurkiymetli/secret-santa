"use client";

import { useState, useEffect } from "react";
import { UserParticipatedEvents, UserEvent } from "./UserParticipatedEvents";
import { UserEventReveal } from "./UserEventReveal";

interface UserViewProps {
  user: any;
}

export function UserView({ user }: UserViewProps) {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (data.events) {
      setEvents(data.events);
      if (data.events.length > 0) {
        setSelectedEvent(data.events[0]);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient">
          Merhaba, {user.username}!
        </h1>
        <p className="text-white/60">Yeni Yıl Çekilişlerinize Hoş Geldiniz</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event List */}
        <UserParticipatedEvents
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
        />

        {/* Event Detail / Reveal */}
        {selectedEvent ? (
          <UserEventReveal key={selectedEvent._id} event={selectedEvent} />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
            Bir etkinlik seçmelisin!
          </div>
        )}
      </div>
    </div>
  );
}
