"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Users, Gift, Play, Plus } from "lucide-react"

interface User {
  _id: string;
  username: string;
  role: string;
  isRevealed: boolean;
}

export function OrganizerView() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState("")
  const [giftLimit, setGiftLimit] = useState("20")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    if (data.users) setUsers(data.users)
  }

  const addUser = async (e: React.FormEvent) => {
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

  const startExchange = async () => {
    if (!confirm("Are you sure? This will shuffle matches for all users.")) return
    
    setLoading(true)
    const res = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftLimit: Number(giftLimit) }),
    })
    
    const data = await res.json()
    setLoading(false)
    
    if (res.ok) {
      setMessage(`Successfully matched ${data.count} participants!`)
    } else {
      setMessage(`Error: ${data.error}`)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Participants
            </CardTitle>
            <CardDescription>Manage who is in the exchange</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addUser} className="flex gap-2 mb-4">
              <Input 
                placeholder="Enter username" 
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/10">
                  <span className="font-medium text-white">{user.username}</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
                    {user.role}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-white/50 py-4">No participants yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" /> Exchange Settings
            </CardTitle>
            <CardDescription>Configure and start the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Gift Value Limit ($)</label>
              <Input 
                type="number" 
                value={giftLimit}
                onChange={(e) => setGiftLimit(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={startExchange}
              disabled={loading || users.length < 2}
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? "Matching..." : "Start Exchange"}
            </Button>
            
            {message && (
              <p className="text-center text-sm font-medium text-green-400 animate-pulse">
                {message}
              </p>
            )}
            
            <div className="p-4 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <p className="font-bold mb-1">⚠️ Important</p>
              Starting the exchange will assign matches. Users can then log in to see their match. You will not see who matched with whom.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
