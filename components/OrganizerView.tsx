"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Users, Gift, Play, Plus, Trash2, Calendar, UserPlus, Shuffle } from "lucide-react"

interface User {
  _id: string;
  username: string;
  role: string;
}

interface Event {
  _id: string;
  name: string;
  giftLimit: number;
  giftDate?: string;
  status: string;
}

export function OrganizerView() {
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const selectedEvent = events.find(e => e._id === selectedEventId)
  
  const [newUser, setNewUser] = useState("")
  const [newEventName, setNewEventName] = useState("")
  const [giftLimit, setGiftLimit] = useState("20")
  const [giftDate, setGiftDate] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchUsers()
    fetchEvents()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    if (data.users) setUsers(data.users)
  }

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events")
    const data = await res.json()
    if (data.events) {
      setEvents(data.events)
      if (data.events.length > 0 && !selectedEventId) {
        setSelectedEventId(data.events[0]._id)
        setGiftLimit(data.events[0].giftLimit.toString())
      }
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser) return
    
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUser }),
    })
    
    if (res.ok) {
      setNewUser("")
      fetchUsers()
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventName) return

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: newEventName, 
        giftLimit: Number(giftLimit),
        giftDate: giftDate || null
      }),
    })

    if (res.ok) {
      setNewEventName("")
      setGiftDate("")
      fetchEvents()
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? Matches will be lost.")) return

    const res = await fetch(`/api/admin/events?id=${id}`, {
      method: "DELETE"
    })

    if (res.ok) {
      if (selectedEventId === id) setSelectedEventId(null)
      fetchEvents()
    }
  }

  const handleMatch = async () => {
    if (!selectedEventId) return
    if (!confirm("Are you sure? This will shuffle matches for this event.")) return
    
    setLoading(true)
    const res = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: selectedEventId }),
    })
    
    const data = await res.json()
    setLoading(false)
    
    if (res.ok) {
      setMessage(`Successfully matched ${data.count} participants!`)
      fetchEvents() // Refresh status
    } else {
      setMessage(`Error: ${data.error}`)
      setMessage(`Hata: ${data.error}`)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Event */}
        <Card className="border-white/10 shadow-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-white" />
              Yeni Çekiliş Oluştur
            </CardTitle>
            <CardDescription>Hediye çekilişlerini yönet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createEvent} className="flex flex-col gap-4 mb-6 md:flex-row">
              <Input 
                placeholder="Etkinlik Adı (örn. Ofis Partisi)" 
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="flex-1"
              />
              <Input 
                type="datetime-local"
                value={giftDate}
                onChange={(e) => setGiftDate(e.target.value)}
                className="w-full md:w-64"
              />
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" /> Oluştur
              </Button>
            </form>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/80 mb-2">Etkinlikleriniz</h3>
              {events.length === 0 && <p className="text-sm text-white/50">Henüz etkinlik yok.</p>}
              {events.map(event => (
                <div 
                  key={event._id} 
                  className={`p-3 rounded border cursor-pointer transition-colors flex justify-between items-center ${
                    selectedEventId === event._id 
                      ? 'bg-white/10 border-white/30' 
                      : 'bg-black/20 border-white/10 hover:bg-white/5'
                  }`}
                  onClick={() => {
                    setSelectedEventId(event._id)
                    setGiftLimit(event.giftLimit.toString())
                    setMessage("")
                  }}
                >
                  <span className="font-medium text-white">{event.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'
                    }`}>
                      {event.status === 'ACTIVE' ? 'AKTİF' : event.status}
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

        {/* Manage Event */}
        {selectedEvent ? (
          <Card className="border-white/10 shadow-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                Katılımcıları Yönet: {selectedEvent.name}
              </CardTitle>
              <CardDescription>Kişi ekle ve eşleştirmeyi başlat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add User Form */}
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
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {users.map((user, index) => {
                  // Generate a festive color based on index
                  const colors = ['bg-red-500', 'bg-green-500', 'bg-silver-500', 'bg-blue-500', 'bg-purple-500'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={user._id} className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/10 group hover:bg-black/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/20`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{user.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
                          {user.role === 'ORGANIZER' ? 'ORGANİZATÖR' : 'KATILIMCI'}
                        </span>
                        {user.role !== 'ORGANIZER' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async () => {
                              if (confirm(`${user.username} silinsin mi?`)) {
                                await fetch(`/api/admin/users?id=${user._id}`, { method: 'DELETE' });
                                fetchUsers();
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {users.length === 0 && (
                  <p className="text-center text-white/50 py-4">Henüz katılımcı yok</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Hediye Limiti (TL)</label>
                <Input 
                  type="number" 
                  value={giftLimit}
                  onChange={(e) => setGiftLimit(e.target.value)}
                />
              </div>

              {selectedEvent.giftDate && (
                 <div className="p-3 rounded bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white/80">
                   <Calendar className="w-4 h-4 text-white" />
                   <span>Çekiliş Tarihi: <span className="font-bold text-white">{new Date(selectedEvent.giftDate).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'long'})}</span></span>
                 </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleMatch}
                disabled={loading || users.length < 2}
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
                Çekilişi başlatmak <strong>{selectedEvent.name}</strong> için eşleşmeleri yapacaktır.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed border-white/20 rounded-lg bg-white/5 text-white/40">
            Yönetmek için soldan bir etkinlik seçin
          </div>
        )}
      </div>
    </div>
  )
}
