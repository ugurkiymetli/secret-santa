import { AuthForm } from "@/components/AuthForm"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex">
        <AuthForm />
      </div>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>
    </main>
  )
}
