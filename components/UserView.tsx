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
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          Hello, {user.username}!
        </h1>
        <p className="text-slate-400">Welcome to the Secret Santa Exchange</p>
      </div>

      <Card className="border-pink-500/30 shadow-pink-500/10">
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
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 rounded-xl border border-dashed border-slate-600 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  onClick={handleReveal}
                >
                  <Gift className="w-16 h-16 text-slate-500 group-hover:text-pink-500 transition-colors mb-4" />
                  <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200">
                    Tap to reveal your match
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 to-violet-600/20 rounded-xl border border-pink-500/50"
                >
                  <p className="text-sm text-slate-400 mb-2">You are buying a gift for</p>
                  <h2 className="text-3xl font-bold text-white tracking-wider">
                    {matchName || "Waiting for Match..."}
                  </h2>
                  {!matchName && (
                    <p className="text-xs text-yellow-400 mt-2">
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
                className="text-slate-500 hover:text-slate-300"
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
