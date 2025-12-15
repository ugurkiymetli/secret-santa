"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Plus, Trash2 } from "lucide-react";
import { Event } from "./types";
import toast from "react-hot-toast";

interface EventManagementProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (event: Event) => void;
  onRefresh: () => void;
}

export function EventManagement({
  events,
  selectedEventId,
  onSelectEvent,
  onRefresh,
}: EventManagementProps) {
  const [newEventName, setNewEventName] = useState("");
  const [giftDate, setGiftDate] = useState("");

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newEventName,
        giftLimit: 20,
        giftDate: giftDate || null,
      }),
    });

    if (res.ok) {
      setNewEventName("");
      setGiftDate("");
      onRefresh();
      toast.success("Etkinlik oluşturuldu!");
    }
  };

  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const deleteEvent = (id: string) => {
    setEventToDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDeleteId) return;

    const res = await fetch(`/api/admin/events?id=${eventToDeleteId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Etkinlik silindi!");
      onRefresh();
    }
    setEventToDeleteId(null);
  };

  return (
    <Card className="border-white/10 shadow-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-white" />
          Yeni Çekiliş Oluştur
        </CardTitle>
        <CardDescription>Hediye çekilişlerini yönet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createEvent} className="flex flex-col gap-4 mb-6">
          <div>
            <label
              htmlFor="event-name"
              className="block mb-1 text-sm font-medium text-white/80"
            >
              Etkinlik Adı
            </label>
            <Input
              id="event-name"
              placeholder="Etkinlik Adı (örn. Ofis Partisi)"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="gift-date"
              className="block mb-1 text-sm font-medium text-white/80"
            >
              Etkinlik Tarihi
            </label>
            <Input
              id="gift-date"
              type="date"
              value={giftDate}
              onChange={(e) => setGiftDate(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Oluştur
          </Button>
        </form>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/80 mb-2">
            Etkinlikleriniz
          </h3>
          {events.length === 0 && (
            <p className="text-sm text-white/50">Henüz etkinlik yok.</p>
          )}
          {events.map((event) => (
            <div
              key={event._id}
              className={`p-3 rounded border cursor-pointer transition-colors flex justify-between items-center ${
                selectedEventId === event._id
                  ? "bg-white/10 border-white/30"
                  : "bg-black/20 border-white/10 hover:bg-white/5"
              }`}
              onClick={() => onSelectEvent(event)}
            >
              <span className="font-medium text-white">{event.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    event.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {event.status === "ACTIVE" ? "AKTİF" : event.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvent(event._id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <ConfirmationModal
        isOpen={!!eventToDeleteId}
        onClose={() => setEventToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Etkinliği Sil"
        message="Bu etkinliği silmek istediğinize emin misiniz? Eşleşmeler kaybolacaktır."
        variant="danger"
        confirmText="Sil"
      />
    </Card>
  );
}
