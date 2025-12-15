"use client";

import { useState, useEffect } from "react";
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
import { Calendar, Shuffle, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { Event, User } from "./types";

interface EventDetailsProps {
  selectedEvent: Event;
  users: User[];
  selectedParticipantIds: string[];
  setSelectedParticipantIds: React.Dispatch<React.SetStateAction<string[]>>; // Or just (ids: string[]) => void, but passing setter is easier for function updating
  onRefresh: () => void;
}

export function EventDetails({
  selectedEvent,
  users,
  selectedParticipantIds,
  setSelectedParticipantIds,
  onRefresh,
}: EventDetailsProps) {
  const [giftLimit, setGiftLimit] = useState(
    selectedEvent.giftLimit.toString()
  );
  const [initialGiftLimit, setInitialGiftLimit] = useState(
    selectedEvent.giftLimit.toString()
  );
  const [loading, setLoading] = useState(false);

  // Sync state when event changes
  useEffect(() => {
    const limit = selectedEvent.giftLimit.toString();
    setGiftLimit(limit);
    setInitialGiftLimit(limit);

    if (selectedEvent.matches && selectedEvent.matches.length > 0) {
      setSelectedParticipantIds(selectedEvent.matches.map((m) => m.giver));
    } else {
      setSelectedParticipantIds(
        users.filter((u) => u.role !== "ORGANIZER").map((u) => u._id)
      );
    }
  }, [selectedEvent, users, setSelectedParticipantIds]);

  const updateGiftLimit = async () => {
    if (!selectedEvent._id) return;

    const res = await fetch("/api/admin/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedEvent._id,
        giftLimit: giftLimit,
      }),
    });

    if (res.ok) {
      setInitialGiftLimit(giftLimit);
      onRefresh(); // To update the list state as well
      toast.success("Hediye limiti güncellendi!");
    }
  };

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const handleMatch = () => {
    if (!selectedEvent._id) return;
    setIsMatchModalOpen(true);
  };

  const performMatch = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: selectedEvent._id,
        participantIds: selectedParticipantIds,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success(`${data.count} katılımcı başarıyla eşleştirildi!`);
      onRefresh(); // Refresh status
    } else {
      toast.error(`Hata: ${data.error}`);
    }
  };

  return (
    <Card className="border-white/10 shadow-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white" />
          {selectedEvent.name}
        </CardTitle>
        <CardDescription>Etkinlik ayarları ve eşleştirme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Hediye Limiti (TL)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={giftLimit}
              onChange={(e) => setGiftLimit(e.target.value)}
            />
            {giftLimit !== initialGiftLimit && (
              <Button
                onClick={updateGiftLimit}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Güncelle
              </Button>
            )}
          </div>
        </div>

        {selectedEvent.giftDate && (
          <div className="p-3 rounded bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white/80">
            <Calendar className="w-4 h-4 text-white" />
            <span>
              Çekiliş Tarihi:{" "}
              <span className="font-bold text-white">
                {new Date(selectedEvent.giftDate).toLocaleString("tr-TR", {
                  timeZone: "Europe/Istanbul",
                  dateStyle: "long",
                })}
              </span>
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80">
              Katılımcıları Seç ({selectedParticipantIds.length})
            </label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedParticipantIds(users.map((u) => u._id))
                }
                className="text-xs h-6 px-2 text-white/60 hover:text-white"
              >
                Tümünü Seç
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedParticipantIds([])}
                className="text-xs h-6 px-2 text-white/60 hover:text-white"
              >
                Hiçbirini Seçme
              </Button>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 grid grid-cols-2 gap-2 border border-white/10 rounded p-2 bg-black/20">
            {users
              .filter((user) => user.role !== "ORGANIZER")
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((user) => {
                const match = selectedEvent.matches?.find(
                  (m) => m.giver === user._id
                );

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      setSelectedParticipantIds((prev) =>
                        prev.includes(user._id)
                          ? prev.filter((id) => id !== user._id)
                          : [...prev, user._id]
                      );
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedParticipantIds.includes(user._id)
                          ? "bg-green-500 border-green-500"
                          : "border-white/30"
                      }`}
                    >
                      {selectedParticipantIds.includes(user._id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            selectedParticipantIds.includes(user._id)
                              ? "text-white"
                              : "text-white/60"
                          }`}
                        >
                          {user.name}
                        </span>
                        {match?.giverRevealedDate && (
                          <span
                            className="text-[10px] text-green-400 bg-green-500/10 px-1 rounded flex items-center gap-1"
                            title="Eşleşmesini Gördü"
                          >
                            <Eye size={10} />
                            {new Date(match.giverRevealedDate).toLocaleString(
                              "tr-TR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/50 font-mono mt-1">
                        {user.username}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <Button
          className={`w-full ${
            selectedEvent.matches && selectedEvent.matches.length > 0
              ? "bg-red-600 hover:bg-red-700 text-white"
              : ""
          }`}
          onClick={handleMatch}
          disabled={loading || selectedParticipantIds.length < 2}
        >
          <Shuffle className="w-4 h-4 mr-2" />
          {loading
            ? "Eşleştiriliyor..."
            : selectedEvent.matches && selectedEvent.matches.length > 0
            ? "Yeniden Eşleştir"
            : "Çekilişi Başlat"}
        </Button>

        <div className="p-4 rounded bg-white/5 border border-white/10 text-xs text-white/60">
          <p className="font-bold mb-1">⚠️ Önemli</p>
          {selectedEvent.matches && selectedEvent.matches.length > 0 ? (
            <span>
              Bu etkinlik için <strong>zaten eşleşme yapılmış</strong>. Yeniden
              eşleştirmek mevcut eşleşmeleri <strong>silecek</strong> ve yeni
              eşleşmeler oluşturacaktır.
            </span>
          ) : (
            <>
              <span>
                Çekilişi başlatmak <strong>{selectedEvent.name}</strong>{" "}
                etkinliği için seçili kişiler ({selectedParticipantIds.length})
                arasında eşleşmeleri yapacaktır.
                <br />
                {selectedParticipantIds.length > 0 && (
                  <span>
                    Katılımcılar:{" "}
                    {users
                      .filter((u) => selectedParticipantIds.includes(u._id))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((u) => u.name)
                      .join(", ")}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </CardContent>

      <ConfirmationModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        onConfirm={performMatch}
        title={
          selectedEvent.matches && selectedEvent.matches.length > 0
            ? "Yeniden Eşleştir"
            : "Eşleşmeleri Başlat"
        }
        message={
          selectedEvent.matches && selectedEvent.matches.length > 0
            ? "DİKKAT: Bu etkinlikte zaten yapılmış bir eşleşme var. Yeniden eşleştirmek mevcut eşleşmeleri SİLECEKTİR. Devam etmek istiyor musunuz?"
            : "Eşleşmeleri başlatmak üzeresiniz. Onaylıyor musunuz?"
        }
        confirmText={
          selectedEvent.matches && selectedEvent.matches.length > 0
            ? "Yeniden Eşleştir"
            : "Başlat"
        }
        variant={
          selectedEvent.matches && selectedEvent.matches.length > 0
            ? "danger"
            : "default"
        }
      />
    </Card>
  );
}
