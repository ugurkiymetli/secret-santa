"use client";

import { useState, useEffect } from "react";
import { UserManagement } from "./UserManagement";
import { EventManagement } from "./EventManagement";
import { EventDetails } from "./EventDetails";
import { User, Event } from "./types";

export function OrganizerView() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >([]);

  // Update selected participants when users change (default to all)
  // This logic was moved to fetchUsers in previous fix.
  const useLogParticipantIds = true;

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) {
      setUsers(data.users);
      if (useLogParticipantIds) {
        setSelectedParticipantIds(data.users.map((u: User) => u._id));
      }
    }
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    if (data.events) {
      setEvents(data.events);
      if (data.events.length > 0 && !selectedEventId) {
        setSelectedEventId(data.events[0]._id);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        <UserManagement users={users} onRefresh={fetchUsers} />
        <div className="space-y-6">
          <EventManagement
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={(event) => setSelectedEventId(event._id)}
            onRefresh={fetchEvents}
          />
          {selectedEvent && (
            <EventDetails
              selectedEvent={selectedEvent}
              users={users}
              selectedParticipantIds={selectedParticipantIds}
              setSelectedParticipantIds={setSelectedParticipantIds}
              onRefresh={fetchEvents}
            />
          )}
        </div>
      </div>
    </div>
  );
}
