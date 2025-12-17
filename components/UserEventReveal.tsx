"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Gift, EyeOff } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { UserEvent } from "./UserParticipatedEvents";

interface UserEventRevealProps {
  event: UserEvent;
}

const CONFETTI_LIMIT = 2;

export function UserEventReveal({ event }: UserEventRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const handleReveal = async () => {
    if (isCooldown) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= CONFETTI_LIMIT) {
      setIsCooldown(true);
      setTimeout(() => {
        setIsCooldown(false);
        setClickCount(0);
      }, 5000);
    }

    if (event) {
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: event._id }),
        });
      } catch (error) {
        console.error("Failed to update reveal status:", error);
      }
    }

    setRevealed(true);
    for (let i = 0; i < randomInRange(10, 15); i++) {
      confetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(80, 120),
        particleCount: randomInRange(100, 300),
        origin: { x: 0.5, y: 0.7 },
        colors: [
          "#FFF5E1",
          "#FF6969",
          "#C80036",
          "#21ff3eff",
          "#FF6D1F",
          "#2540a1ff",
        ],
      });
      await new Promise((resolve) =>
        setTimeout(resolve, randomInRange(100, 200))
      );
    }
  };

  return (
    <Card className="border-white/10 shadow-white/5 h-fit">
      <CardHeader className="text-center pb-2">
        <CardTitle>{event.name}</CardTitle>
        <CardDescription className="flex flex-col gap-1">
          <span>
            Hediye Limiti:{" "}
            <span className="font-bold text-green-400">
              {event.giftLimit} TL
            </span>
          </span>
          {event.giftDate && (
            <span>
              Hediyeleşme Tarihi:{" "}
              <span className="font-bold text-white">
                {new Date(event.giftDate).toLocaleString("tr-TR", {
                  timeZone: "Europe/Istanbul",
                  dateStyle: "long",
                })}
              </span>
            </span>
          )}
          {event.matchDate && (
            <span>
              Eşleşme Tarihi:{" "}
              <span className="font-bold text-white">
                {new Date(event.matchDate).toLocaleString("tr-TR", {
                  timeZone: "Europe/Istanbul",
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </span>
          )}

        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8 space-y-6">
        {event.matchName ? (
          <div
            className="relative w-64 h-64 cursor-pointer perspective-1000"
            onClick={handleReveal}
          >
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
                <p className="text-white/60 text-sm mt-2">
                  Öğrenmek için tıkla!
                </p>
              </div>

              {/* Back (Result) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center border-4 border-white p-6">
                <p className="text-gray-500 font-medium mb-2">
                  Senin Eşleşmen:
                </p>
                <h2
                  className={`${(event.matchName?.length || 0) > 15
                    ? "text-xl"
                    : (event.matchName?.length || 0) > 10
                      ? "text-2xl"
                      : "text-3xl"
                    } font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 text-center px-2`}
                >
                  {event.matchName}
                </h2>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    Şşşt! Kimseye söyleme 🤫
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center p-8 bg-white/5 rounded-lg border border-dashed border-white/10">
            <p className="text-white/60">Henüz eşleşme yapılmadı.</p>
            <p className="text-xs text-white/40 mt-2">
              Organizatör çekilişi başlattığında burada göreceksin.
            </p>
          </div>
        )}

        {revealed && event.matchName && (
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
  );
}
