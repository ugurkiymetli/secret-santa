"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Gift, Eye, EyeOff, Calendar, ChevronRight } from "lucide-react"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

interface Event {
  _id: string;
  name: string;
  giftLimit: number;
  giftDate?: string;
  matchName: string | null;
}

interface UserViewProps {
  user: any;
}

export function UserView({ user }: UserViewProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch("/api/events")
    const data = await res.json()
    if (data.events) {
      setEvents(data.events)
      if (data.events.length > 0) {
        setSelectedEvent(data.events[0])
      }
    }
  }

  const handleReveal = () => {
    setRevealed(true)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#ffffff']
    })
  }

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
        <Card className="border-white/10 shadow-white/5 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-white" />
              Çekilişlerim
            </CardTitle>
            <CardDescription>Katıldığınız etkinlikler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 && <p className="text-sm text-white/50">Henüz bir etkinliğe katılmadınız.</p>}
            {events.map(event => (
              <div 
                key={event._id} 
                className={`p-3 rounded border cursor-pointer transition-colors flex justify-between items-center ${
                  selectedEvent?._id === event._id 
                    ? 'bg-white/10 border-white/30' 
                    : 'bg-black/20 border-white/10 hover:bg-white/5'
                }`}
                onClick={() => {
                  setSelectedEvent(event);
                  setRevealed(false);
                }}
              >
                <span className="font-medium text-white">{event.name}</span>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Event Detail / Reveal */}
        {selectedEvent ? (
          <Card className="border-white/10 shadow-white/5 h-fit">
            <CardHeader className="text-center pb-2">
              <CardTitle>{selectedEvent.name}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>Hediye Limiti: <span className="font-bold text-green-400">{selectedEvent.giftLimit} TL</span></span>
                {selectedEvent.giftDate && (
                  <span>Çekiliş Tarihi: <span className="font-bold text-white">{new Date(selectedEvent.giftDate).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'long'})}</span></span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8 space-y-6">
              {selectedEvent.matchName ? (
                <div className="relative w-64 h-64 cursor-pointer perspective-1000" onClick={handleReveal}>
                  <motion.div
                    initial={false}
                    animate={{ rotateY: revealed ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="w-full h-full relative preserve-3d"
                  >
                    {/* Front (Scratch Card) */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-2xl flex flex-col items-center justify-center border-4 border-white/20">
                      <Gift className="w-16 h-16 text-white mb-4 animate-bounce" />
                      <p className="text-white font-bold text-xl">Eşleşmeni Gör</p>
                      <p className="text-white/60 text-sm mt-2">Öğrenmek için tıkla!</p>
                    </div>

                    {/* Back (Result) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center border-4 border-white p-6">
                      <p className="text-gray-500 font-medium mb-2">Senin Eşleşmen:</p>
                      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 text-center break-all">
                        {selectedEvent.matchName}
                      </h2>
                      <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">Şşşt! Kimseye söyleme 🤫</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center p-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                  <p className="text-white/60">Henüz eşleşme yapılmadı.</p>
                  <p className="text-xs text-white/40 mt-2">Organizatör çekilişi başlattığında burada göreceksin.</p>
                </div>
              )}

              {revealed && selectedEvent.matchName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevealed(false);
                    }}
                    className="text-white/40 hover:text-white"
                  >
                    <EyeOff className="w-4 h-4 mr-2" /> Gizle
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
            Select an event to view details
          </div>
        )}
      </div>
    </div>
  )
}
