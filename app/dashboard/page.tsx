import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { OrganizerView } from "@/components/OrganizerView";
import { UserView } from "@/components/UserView";
import LogoutButton from "@/components/LogoutButton";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const payload: any = await verifyToken(token);
  if (!payload) return null;

  await dbConnect();
  const user = await User.findById(payload.userId).lean();
  return user;
}

export default async function Dashboard() {
  const user: any = await getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold text-lg tracking-tight">
            Yılbaşı Çekilişi - {new Date().getFullYear() + 1}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden md:inline">
            Hoşgeldin,
            <span className="text-slate-200">{user.username}</span>
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {user.role === "ORGANIZER" ? (
          <OrganizerView />
        ) : (
          <UserView user={JSON.parse(JSON.stringify(user))} />
        )}
      </main>
    </div>
  );
}
