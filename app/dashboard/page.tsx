import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Event from "@/models/Event"
import { OrganizerView } from "@/components/OrganizerView"
import { UserView } from "@/components/UserView"
import { Button } from "@/components/ui/Button"
import { LogOut } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  
  if (!token) return null
  
  const payload: any = await verifyToken(token)
  if (!payload) return null
  
  await dbConnect()
  const user = await User.findById(payload.userId).populate('assignedMatch').lean()
  return user
}

async function getEvent() {
  await dbConnect()
  return await Event.findOne().lean()
}

export default async function Dashboard() {
  const user: any = await getUser()
  const event: any = await getEvent()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600" />
          <span className="font-bold text-lg tracking-tight">Secret Santa</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden md:inline">
            Logged in as <span className="text-slate-200">{user.username}</span>
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {user.role === 'ORGANIZER' ? (
          <OrganizerView />
        ) : (
          <UserView 
            user={JSON.parse(JSON.stringify(user))} 
            matchName={user.assignedMatch?.username || null}
            giftLimit={event?.giftLimit || 0}
          />
        )}
      </main>
    </div>
  )
}
