"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  UserPlus,
  Shuffle,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  isActivated?: boolean;
}

interface Match {
  giver: string;
  receiver: string;
  isRevealed: boolean;
  giverRevealedDate?: string;
}

interface Event {
  _id: string;
  name: string;
  giftLimit: number;
  giftDate?: string;
  status: string;
  matches?: Match[];
}

export function OrganizerView() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const [newUser, setNewUser] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [giftLimit, setGiftLimit] = useState("20");
  const [initialGiftLimit, setInitialGiftLimit] = useState("20");
  const [giftDate, setGiftDate] = useState("");

  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Update selected participants when users change (default to all)
  useEffect(() => {
    if (useLogParticipantIds) {
      setSelectedParticipantIds(users.map((u) => u._id));
    }
  }, [users]);

  // Hack: use ref or just dependence on users. Let's just set it initially.
  // Actually, better to just default to all when opening an event if we haven't set it?
  // Let's stick to: Default all checked when users list loads.
  const useLogParticipantIds = true;

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) setUsers(data.users);
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    if (data.events) {
      setEvents(data.events);
      if (data.events.length > 0 && !selectedEventId) {
        setSelectedEventId(data.events[0]._id);
        const limit = data.events[0].giftLimit.toString();
        setGiftLimit(limit);
        setInitialGiftLimit(limit);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser) return;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newUser }),
    });

    if (res.ok) {
      setNewUser("");
      fetchUsers();
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newEventName,
        giftLimit: Number(giftLimit),
        giftDate: giftDate || null,
      }),
    });

    if (res.ok) {
      setNewEventName("");
      setGiftDate("");
      fetchEvents();
    }
  };

  const updateGiftLimit = async () => {
    if (!selectedEventId) return;

    const res = await fetch("/api/admin/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedEventId,
        giftLimit: giftLimit,
      }),
    });

    if (res.ok) {
      setInitialGiftLimit(giftLimit);
      fetchEvents(); // To update the list state as well
      setMessage("Hediye limiti güncellendi!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const deleteEvent = async (id: string) => {
    if (
      !confirm(
        "Bu etkinliği silmek istediğinize emin misiniz? Eşleşmeler kaybolacaktır."
      )
    )
      return;

    const res = await fetch(`/api/admin/events?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      if (selectedEventId === id) setSelectedEventId(null);
      fetchEvents();
    }
  };

  const handleMatch = async () => {
    if (!selectedEventId) return;
    if (
      !confirm(
        "Emin misiniz? Bu işlem bu etkinlik için eşleşmeleri karıştıracaktır."
      )
    )
      return;

    setLoading(true);
    const res = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: selectedEventId,
        participantIds: selectedParticipantIds,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage(`${data.count} katılımcı başarıyla eşleştirildi!`);
      fetchEvents(); // Refresh status
    } else {
      setMessage(`Hata: ${data.error}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <Card className="border-white/10 shadow-white/5 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              Katılımcıları Yönet
            </CardTitle>
            <CardDescription>Tüm katılımcıları ekle veya çıkar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={createUser} className="flex gap-2">
              <Input
                placeholder="Katılımcı Adı"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
              <Button type="submit">
                <UserPlus className="w-4 h-4 mr-2" /> Ekle
              </Button>
            </form>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {users.map((user, index) => {
                const colors = [
                  "bg-red-500",
                  "bg-green-500",
                  "bg-emerald-500",
                  "bg-blue-500",
                  "bg-purple-500",
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/10 group hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/20`}
                      >
                        {(user.name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white leading-none flex items-center gap-1">
                          {user.name || user.username}
                          {user.isActivated && (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          )}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono mt-1">
                          {user.username}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
                        {user.role === "ORGANIZER"
                          ? "ORGANİZATÖR"
                          : "KATILIMCI"}
                      </span>
                      {user.role !== "ORGANIZER" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 bg-red-900/20 hover:bg-red-900/40"
                          onClick={async () => {
                            if (confirm(`${user.username} silinsin mi?`)) {
                              await fetch(`/api/admin/users?id=${user._id}`, {
                                method: "DELETE",
                              });
                              fetchUsers();
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && (
                <p className="text-center text-white/50 py-4">
                  Henüz katılımcı yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Management */}
        <div className="space-y-6">
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
                <Input
                  placeholder="Etkinlik Adı (örn. Ofis Partisi)"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full"
                />
                <div className="flex flex-col gap-4 md:flex-row">
                  <Input
                    type="date"
                    value={giftDate}
                    onChange={(e) => setGiftDate(e.target.value)}
                    className="w-full md:w-auto md:flex-1"
                  />
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Oluştur
                  </Button>
                </div>
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
                    onClick={() => {
                      setSelectedEventId(event._id);
                      const limit = event.giftLimit.toString();
                      setGiftLimit(limit);
                      setInitialGiftLimit(limit);
                      setMessage("");
                    }}
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
          </Card>

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card className="border-white/10 shadow-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white" />
                  {selectedEvent.name}
                </CardTitle>
                <CardDescription>
                  Etkinlik ayarları ve eşleştirme
                </CardDescription>
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
                        {new Date(selectedEvent.giftDate).toLocaleString(
                          "tr-TR",
                          { timeZone: "Europe/Istanbul", dateStyle: "long" }
                        )}
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

                  <div className="max-h-[200px] overflow-y-auto pr-2 space-y-1 border border-white/10 rounded p-2 bg-black/20">
                    {users
                      .filter((user) => user.role !== "ORGANIZER")
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
                                    {new Date(
                                      match.giverRevealedDate
                                    ).toLocaleString("tr-TR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
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
                  className="w-full"
                  onClick={handleMatch}
                  disabled={loading || selectedParticipantIds.length < 2}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {loading ? "Eşleştiriliyor..." : "Çekilişi Başlat"}
                </Button>

                {message && (
                  <p className="text-center text-sm font-medium text-green-400 animate-pulse">
                    {message}
                  </p>
                )}
                <div className="p-4 rounded bg-white/5 border border-white/10 text-xs text-white/60">
                  <p className="font-bold mb-1">⚠️ Önemli</p>
                  Çekilişi başlatmak <strong>{selectedEvent.name}</strong>{" "}
                  etkinliği için seçili kişiler ({selectedParticipantIds.length}
                  ) arasında eşleşmeleri yapacaktır.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
