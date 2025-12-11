"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Gift, Eye, EyeOff } from "lucide-react"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

interface UserViewProps {
  user: any;
  matchName: string | null;
  giftLimit: number;
}

export function UserView({ user, matchName, giftLimit }: UserViewProps) {
  const [revealed, setRevealed] = useState(false)

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
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient">
          Hello, {user.username}!
        </h1>
        <p className="text-white/60">Welcome to the Secret Santa Exchange</p>
      </div>

      <Card className="border-white/10 shadow-amber-500/5">
        <CardHeader className="text-center pb-2">
          <CardTitle>Your Mission</CardTitle>
          <CardDescription>
            Budget Limit: <span className="font-bold text-green-400">${giftLimit}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 space-y-6">
          <div className="relative w-full h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-black/30 transition-colors group"
                  onClick={handleReveal}
                >
                  <Gift className="w-16 h-16 text-white/40 group-hover:text-amber-400 transition-colors mb-4" />
                  <p className="text-sm font-medium text-white/60 group-hover:text-white">
                    Tap to reveal your match
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/50 to-amber-900/50 rounded-xl border border-amber-500/30"
                >
                  <p className="text-sm text-white/60 mb-2">You are buying a gift for</p>
                  <h2 className="text-3xl font-bold text-white tracking-wider drop-shadow-lg">
                    {matchName || "Waiting for Match..."}
                  </h2>
                  {!matchName && (
                    <p className="text-xs text-amber-200/80 mt-2">
                      (The organizer hasn't started the exchange yet)
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {revealed && matchName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRevealed(false)}
                className="text-white/40 hover:text-white"
              >
                <EyeOff className="w-4 h-4 mr-2" /> Hide Match
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
