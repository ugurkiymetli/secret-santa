"use client"

import { Button } from "@/components/ui/Button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  )
}
